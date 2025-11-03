from __future__ import annotations
# ------------------------------
# Advanced PLATYPUS builder v2
# ------------------------------

def build_invoice_pdf(buffer: BytesIO, data: Dict[str, Any], *, font_color_str: Optional[str] = None, page_color_str: Optional[str] = None) -> None:
    from reportlab.platypus import PageTemplate, Frame

    # Page + styles
    A4_WIDTH, A4_HEIGHT = A4
    left_margin = 25 * mm
    right_margin = 25 * mm
    top_margin = 20 * mm
    bottom_margin = 20 * mm

    styles = getSampleStyleSheet()
    for key in list(styles.byName.keys()):
        styles[key].fontName = 'Helvetica'

    def _first(source: Any, *keys: str, default: Any = None) -> Any:
        if not isinstance(source, dict):
            return default
        for key in keys:
            if key not in source:
                continue
            value = source.get(key)
            if isinstance(value, str):
                trimmed = value.strip()
                if trimmed:
                    return trimmed
            elif value is not None:
                return value
        return default

    def _as_str(value: Any, default: str = '') -> str:
        if value is None:
            return default
        text = str(value).strip()
        return text or default

    def _human_date(raw: Any, fallback: str) -> str:
        text = _as_str(raw, '')
        if not text:
            return fallback
        try:
            normalized = text.replace('Z', '+00:00')
            dt = datetime.fromisoformat(normalized)
            return dt.strftime('%d %b %Y')
        except Exception:
            return text

    ZERO = Decimal('0')
    ONE = Decimal('1')

    def _as_decimal(value: Any, fallback: Decimal) -> Decimal:
        if value is None:
            return fallback
        candidate = value
        if isinstance(candidate, str):
            candidate = candidate.strip()
            if not candidate:
                return fallback
        try:
            return Decimal(str(candidate))
        except Exception:
            return fallback

    def _rate_decimal(value: Any) -> Decimal:
        rate = _as_decimal(value, ZERO)
        if rate < ZERO:
            return ZERO
        if rate > ONE:
            try:
                rate = rate / Decimal('100')
            except Exception:
                return ZERO
        return rate

    def _percent_display(rate: Decimal) -> str:
        pct = rate * Decimal('100')
        pct_str = f"{pct:.2f}".rstrip('0').rstrip('.')
        return pct_str or '0'

    def _label_with_percent(base: str, rate: Decimal) -> str:
        if rate <= ZERO:
            return base
        return f"{base} ({_percent_display(rate)}%)"

    def _normalize_styles(value: Any) -> set[str]:
        if isinstance(value, str):
            token = value.strip().lower()
            return {token} if token else set()
        if isinstance(value, (list, tuple, set)):
            out: set[str] = set()
            for item in value:
                if isinstance(item, str):
                    token = item.strip().lower()
                    if token:
                        out.add(token)
            return out
        return set()

    def _font_from_styles(styles: set[str], *, prefer_bold: bool = False) -> str:
        bold = 'bold' in styles or prefer_bold
        italic = 'italic' in styles
        if bold and italic:
            return 'Helvetica-BoldOblique'
        if bold:
            return 'Helvetica-Bold'
        if italic:
            return 'Helvetica-Oblique'
        return 'Helvetica'

    def _resolve_image_reference(ref: Any) -> Optional[ImageReader]:
        if ref is None:
            return None
        try:
            if isinstance(ref, ImageReader):
                return ref
            if isinstance(ref, bytes):
                return ImageReader(BytesIO(ref))
            if hasattr(ref, 'read'):
                return ImageReader(ref)
            if isinstance(ref, dict):
                nested = (
                    ref.get('data')
                    or ref.get('bytes')
                    or ref.get('url')
                    or ref.get('src')
                    or ref.get('path')
                )
                if nested is not None:
                    return _resolve_image_reference(nested)
                return None
            if isinstance(ref, str):
                candidate = ref.strip()
                if not candidate:
                    return None
                if candidate.startswith('data:image'):
                    try:
                        _, b64_data = candidate.split(',', 1)
                        blob = base64.b64decode(b64_data)
                        return ImageReader(BytesIO(blob))
                    except Exception as exc:
                        logger.warning("Failed to decode marketing data URL: %s", exc)
                        return None
                lowered = candidate.lower()
                if lowered.startswith('http://') or lowered.startswith('https://'):
                    try:
                        with urlopen(candidate, timeout=5) as response:
                            data_bytes = response.read()
                        return ImageReader(BytesIO(data_bytes))
                    except (HTTPError, URLError, TimeoutError) as exc:
                        logger.warning("Failed to fetch marketing image from %s: %s", candidate, exc)
                        return None
                    except Exception as exc:
                        logger.warning("Unexpected error fetching marketing image %s: %s", candidate, exc)
                        return None
                candidate_path = Path(candidate)
                if candidate_path.exists():
                    try:
                        return ImageReader(BytesIO(candidate_path.read_bytes()))
                    except Exception as exc:
                        logger.warning("Failed to read marketing image file %s: %s", candidate, exc)
                        return None
                try:
                    blob = base64.b64decode(candidate, validate=True)
                    return ImageReader(BytesIO(blob))
                except Exception:
                    logger.warning("Unsupported marketing image reference provided; skipping")
                    return None
        except Exception as exc:
            logger.warning("Unable to resolve marketing image reference: %s", exc)
        return None

    font_color_hex = font_color_str or _first(
        data, 'fontColor', 'font_color', 'textColor', 'text_color'
    )
    page_color_hex = page_color_str or _first(
        data, 'pageColor', 'page_color', 'backgroundColor', 'background_color'
    )

    font_color = _parse_hex_color(font_color_hex, '#111111')
    divider = colors.HexColor('#DDDDDD')
    page_color = _parse_hex_color(page_color_hex, '#FFFFFF')

    brand_style = ParagraphStyle('BrandTitle', parent=styles['Title'], alignment=1, fontName='Helvetica-Bold', fontSize=22, leading=26, textColor=font_color)
    invoice_title_style = ParagraphStyle('InvoiceTitle', parent=styles['Normal'], alignment=1, fontName='Helvetica-Bold', fontSize=15, leading=18, textColor=font_color)
    label_style = ParagraphStyle('Label', parent=styles['Normal'], fontSize=9, leading=11, textColor=font_color)
    value_style = ParagraphStyle('Value', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=11, leading=13, textColor=font_color)
    small_style = ParagraphStyle('Small', parent=styles['Normal'], fontSize=9, leading=12, textColor=font_color)
    num_right = ParagraphStyle('NumRight', parent=small_style, alignment=TA_RIGHT)

    def para(text: str, style: ParagraphStyle) -> Paragraph:
        return Paragraph(escape(text), style)

    # Extract data
    customer = _first(data, 'customer', 'client', default={})
    customer = customer if isinstance(customer, dict) else {}

    organization_info = _first(data, 'organization', 'brand', default={})
    organization = organization_info if isinstance(organization_info, dict) else {}
    organization_name = _as_str(
        _first(organization, 'name', 'displayName', 'organizationName'),
        '',
    )

    org_or_from = _as_str(
        _first(
            data,
            'from_name',
            'fromName',
            'organization_name',
            'organizationName',
            default=organization_name or 'Your Company',
        ),
        organization_name or 'Your Company',
    )
    customer_name = _as_str(_first(customer, 'name', 'fullName', 'customerName'), '')
    to_name = _as_str(
        _first(data, 'to_name', 'toName', default=customer_name),
        customer_name,
    )
    to_email = _as_str(_first(customer, 'email', 'Email'), '')
    to_address = _as_str(_first(data, 'to_address', 'toAddress'), '')
    from_address = _as_str(_first(data, 'from_address', 'fromAddress'), '')
    from_email = _as_str(_first(data, 'from_email', 'fromEmail'), '')
    invoice_title_text = _as_str(_first(data, 'invoice_title', 'invoiceTitle', 'title'), '')
    invoice_id = _as_str(
        _first(data, 'invoice_id', 'invoiceId', 'id', 'invoiceNumber'), 'N/A'
    ) or 'N/A'

    issue_date_raw = _first(
        data,
        'issue_date_human',
        'issueDateHuman',
        'issue_date',
        'issueDate',
        'invoiceDate',
    )
    due_date_raw = _first(
        data,
        'due_date_human',
        'dueDateHuman',
        'due_date',
        'dueDate',
    )
    issue_date_human = _human_date(issue_date_raw, 'Not provided')
    due_date_human = _human_date(due_date_raw, 'Not provided')

    po_number = _as_str(_first(data, 'po_number', 'poNumber', 'purchaseOrder'), 'N/A')
    payment_term = _as_str(
        _first(data, 'payment_term', 'paymentTerm', 'paymentTerms'), 'N/A'
    )
    currency = _as_str(_first(data, 'currency', 'currencyCode'), 'USD')

    raw_items = _first(data, 'items', 'lineItems', 'entries', default=[])
    items = raw_items if isinstance(raw_items, list) else []

    logo_candidate = _first(
        data,
        'logo',
        'logo_url',
        'logoUrl',
        'company_logo',
        'companyLogo',
        'brand_logo',
        'brandLogo',
    )
    if not logo_candidate:
        logo_candidate = _first(
            organization,
            'logo',
            'logo_url',
            'logoUrl',
            'logoPath',
        )

    raw_logo_max_width = _first(
        data,
        'logo_max_width',
        'logoMaxWidth',
        'logo_width',
        'logoWidth',
    )
    if raw_logo_max_width is None:
        raw_logo_max_width = _first(
            organization,
            'logo_max_width',
            'logoMaxWidth',
            'logo_width',
            'logoWidth',
        )

    raw_logo_max_height = _first(
        data,
        'logo_max_height',
        'logoMaxHeight',
        'logo_height',
        'logoHeight',
    )
    if raw_logo_max_height is None:
        raw_logo_max_height = _first(
            organization,
            'logo_max_height',
            'logoMaxHeight',
            'logo_height',
            'logoHeight',
        )

    logo_alignment_value = _as_str(
        _first(
            data,
            'logo_alignment',
            'logoAlignment',
            'logo_position',
            'logoPosition',
            'logoPlacement',
        ),
        '',
    )
    if not logo_alignment_value:
        logo_alignment_value = _as_str(
            _first(
                organization,
                'logo_alignment',
                'logoAlignment',
                'logo_position',
                'logoPosition',
                'logoPlacement',
            ),
            '',
        )
    logo_alignment = (logo_alignment_value or 'left').lower().strip()

    class _LogoFlowable(Flowable):
        def __init__(self, image_reader: ImageReader, width: float, height: float, align: str = 'LEFT') -> None:
            super().__init__()
            self.image_reader = image_reader
            self.draw_width = width
            self.draw_height = height
            self.width = width
            self.height = height
            self.hAlign = align.upper()

        def wrap(self, avail_width: float, avail_height: float) -> Tuple[float, float]:
            return self.draw_width, self.draw_height

        def draw(self) -> None:
            self.canv.drawImage(
                self.image_reader,
                0,
                0,
                width=self.draw_width,
                height=self.draw_height,
                preserveAspectRatio=True,
                mask='auto',
            )

    class _StackedFlowable(Flowable):
        def __init__(self, items: List[Flowable]) -> None:
            super().__init__()
            self.items = list(items)
            self._width: float = 0.0
            self._height: float = 0.0

        def wrap(self, avail_width: float, avail_height: float) -> Tuple[float, float]:
            total_height = 0.0
            max_width = 0.0
            for item in self.items:
                try:
                    w, h = item.wrap(avail_width, avail_height)
                except Exception:
                    w, h = (0.0, 0.0)
                total_height += h
                max_width = max(max_width, w)
            self._width = max_width
            self._height = total_height
            return max_width, total_height

        def draw(self) -> None:
            canv = self.canv
            y_cursor = self._height
            for item in self.items:
                try:
                    w, h = item.wrap(self._width, self._height)
                except Exception:
                    w, h = (0.0, 0.0)
                y_cursor -= h
                item.drawOn(canv, 0, y_cursor)

    logo_flowable: Optional[Flowable] = None
    if logo_candidate:
        logo_reader = _resolve_image_reference(logo_candidate)
        if logo_reader:
            try:
                img_width, img_height = logo_reader.getSize()
            except Exception as exc:
                logger.warning("Failed to determine logo dimensions: %s", exc)
                img_width, img_height = (0, 0)
            if img_width > 0 and img_height > 0:
                default_logo_width = Decimal('160')
                default_logo_height = Decimal('80')
                max_width_decimal = _as_decimal(raw_logo_max_width, default_logo_width)
                if max_width_decimal <= ZERO:
                    max_width_decimal = default_logo_width
                max_height_decimal = _as_decimal(raw_logo_max_height, default_logo_height)
                if max_height_decimal <= ZERO:
                    max_height_decimal = default_logo_height

                max_width = float(max_width_decimal)
                max_height = float(max_height_decimal)
                width_ratio = max_width / float(img_width)
                height_ratio = max_height / float(img_height)
                scale = min(width_ratio, height_ratio, 1.0)
                draw_width = float(img_width) * scale
                draw_height = float(img_height) * scale
                try:
                    logo_flowable = _LogoFlowable(logo_reader, draw_width, draw_height, align=logo_alignment)
                except Exception as exc:
                    logger.warning("Failed to prepare logo for PDF embedding: %s", exc)
                    logo_flowable = None
            else:
                logger.warning("Logo resolved but dimensions were invalid; skipping logo embed")
        else:
            logger.warning("Unable to resolve provided logo reference; skipping logo embed")

    notes = _as_str(_first(data, 'notes', 'note', 'memo'), '')
    terms = _as_str(_first(data, 'terms', 'termsAndConditions', 'conditions'), '')
    marketing_info = _first(data, 'marketing', 'marketingBlock')
    marketing_info = marketing_info if isinstance(marketing_info, dict) else None
    marketing_styles: set[str] = _normalize_styles((marketing_info or {}).get('fontStyle'))
    marketing_font_color = _parse_hex_color((marketing_info or {}).get('fontColor'), '#1F2937')
    marketing_background_color_value = _first(
        marketing_info or {},
        'backgroundColor',
        'background_color',
    )
    marketing_background_color = _parse_hex_color(marketing_background_color_value, '#F3F4F6')
    def _parse_opacity(value: Any, default: float = 1.0) -> float:
        try:
            opacity = float(value)
        except (TypeError, ValueError):
            return default
        if opacity < 0:
            return 0.0
        if opacity > 1:
            if opacity <= 100:
                opacity = opacity / 100.0
            else:
                opacity = 1.0
        return max(0.0, min(1.0, opacity))

    marketing_background_image_ref = _first(
        marketing_info or {},
        'background_image',
        'backgroundImage',
        'background_image_url',
        'backgroundImageUrl',
        'backgroundImageURL',
        'background_image_base64',
        'backgroundImageBase64',
        'backgroundImageData',
    )
    marketing_background_image = _resolve_image_reference(marketing_background_image_ref)
    marketing_background_image_opacity = _parse_opacity(
        _first(
            marketing_info or {},
            'background_image_opacity',
            'backgroundImageOpacity',
            'background_image_alpha',
            'backgroundImageAlpha',
        ),
        1.0,
    )
    marketing_headline_font = _font_from_styles(marketing_styles, prefer_bold=True)
    marketing_body_font = _font_from_styles(marketing_styles, prefer_bold=False)
    marketing_has_underline = 'underline' in marketing_styles
    marketing_headline_text = str((marketing_info or {}).get('headline') or '').strip()
    marketing_message_text = str((marketing_info or {}).get('message') or '').strip()
    marketing_cta_text = str((marketing_info or {}).get('ctaText') or '').strip()
    marketing_cta_link = str((marketing_info or {}).get('ctaLink') or '').strip() or None
    marketing_has_content = any([
        marketing_headline_text,
        marketing_message_text,
        marketing_cta_text,
        marketing_background_image is not None,
        bool(marketing_background_color_value),
        marketing_background_image is not None and marketing_background_image_opacity < 1.0,
    ])

    marketing_banner_flowable: Optional[Flowable] = None
    if marketing_info and marketing_has_content:
        class MarketingBannerFlowable(Flowable):
            def __init__(
                self,
                headline: str,
                message: str,
                cta_text: str,
                cta_link: Optional[str],
                font_color: colors.Color,
                background_color: colors.Color,
                background_image: Optional[ImageReader],
                background_image_opacity: float,
                headline_font: str,
                body_font: str,
                underline: bool,
            ) -> None:
                super().__init__()
                self._width: float = 0.0
                self.headline = headline
                self.message = message
                self.cta_text = cta_text
                self.cta_link = cta_link
                self.font_color = font_color
                self.background_color = background_color
                self.background_image = background_image
                self.background_image_opacity = max(0.0, min(1.0, background_image_opacity))
                self.headline_font = headline_font
                self.body_font = body_font
                self.underline = underline
                self.padding_x = 24.0
                self.padding_top = 28.0
                self.padding_bottom = 30.0
                self.line_gap = 10.0
                self.button_gap = 18.0
                self.button_height = 26.0

                content_height = 0.0
                if self.headline:
                    content_height += 16.0
                if self.message:
                    if content_height > 0:
                        content_height += self.line_gap
                    content_height += 11.0
                if self.cta_text:
                    if content_height > 0:
                        content_height += self.button_gap
                    content_height += self.button_height

                self.banner_height = max(
                    self.padding_top + self.padding_bottom + content_height,
                    140.0,
                )
                self.spaceBefore = 18.0
                self.spaceAfter = 12.0

            def wrap(self, avail_width: float, avail_height: float) -> Tuple[float, float]:
                self._width = avail_width
                return avail_width, self.banner_height

            def draw(self) -> None:
                canv = self.canv
                cx = self._width / 2.0
                y = self.banner_height - self.padding_top
                content_width = self._width - (self.padding_x * 2.0)

                def draw_text_line(
                    text: str,
                    font_name: str,
                    font_size: float,
                    gap_after: float,
                ) -> None:
                    nonlocal y
                    canv.setFillColor(self.font_color)
                    canv.setStrokeColor(self.font_color)
                    canv.setFont(font_name, font_size)
                    canv.drawCentredString(cx, y, text)
                    if self.underline:
                        width = stringWidth(text, font_name, font_size)
                        if width > 0:
                            underline_y = y - 2.0
                            canv.setLineWidth(0.5)
                            canv.line(cx - width / 2.0, underline_y, cx + width / 2.0, underline_y)
                    y -= font_size + gap_after

                canv.saveState()
                try:
                    canv.setFillColor(self.background_color)
                    canv.setStrokeColor(self.background_color)
                    canv.roundRect(
                        0,
                        0,
                        self._width,
                        self.banner_height,
                        14.0,
                        stroke=0,
                        fill=1,
                    )
                    if self.background_image:
                        canv.saveState()
                        try:
                            path = canv.beginPath()
                            path.roundRect(0, 0, self._width, self.banner_height, 14.0)
                            canv.clipPath(path, stroke=0)
                            if self.background_image_opacity < 1.0:
                                try:
                                    canv.setFillAlpha(self.background_image_opacity)
                                    canv.setStrokeAlpha(self.background_image_opacity)
                                except Exception:
                                    pass
                            try:
                                img_width, img_height = self.background_image.getSize()
                            except Exception as exc:
                                logger.warning("Failed to read marketing background image size: %s", exc)
                                img_width, img_height = (0, 0)

                            if img_width > 0 and img_height > 0:
                                scale = max(self._width / img_width, self.banner_height / img_height)
                                scaled_width = img_width * scale
                                scaled_height = img_height * scale
                                offset_x = (self._width - scaled_width) / 2.0
                                offset_y = (self.banner_height - scaled_height) / 2.0
                            else:
                                scaled_width = self._width
                                scaled_height = self.banner_height
                                offset_x = 0.0
                                offset_y = 0.0

                            canv.drawImage(
                                self.background_image,
                                offset_x,
                                offset_y,
                                width=scaled_width,
                                height=scaled_height,
                                preserveAspectRatio=False,
                                mask='auto',
                            )
                        except Exception as exc:
                            logger.warning("Failed to render marketing background image: %s", exc)
                        finally:
                            canv.restoreState()
                    canv.setFillColor(self.font_color)
                    canv.setStrokeColor(self.font_color)
                    if self.headline:
                        gap = self.line_gap if (self.message or self.cta_text) else 0.0
                        draw_text_line(self.headline, self.headline_font, 16.0, gap)
                    if self.message:
                        gap = 0.0 if self.cta_text else self.line_gap
                        draw_text_line(self.message, self.body_font, 11.0, gap)
                    if self.cta_text:
                        y = max(y - self.button_gap, self.padding_bottom + self.button_height)
                        btn_font_size = 10.0
                        tw = stringWidth(self.cta_text, self.headline_font, btn_font_size)
                        max_button_width = max(120.0, min(content_width, 200.0))
                        bw = max(120.0, min(max_button_width, tw + 44.0))
                        bh = self.button_height
                        bx = max(self.padding_x, min(cx - bw / 2.0, self._width - self.padding_x - bw))
                        by = max(y - bh, self.padding_bottom)
                        canv.setFillColor(self.font_color)
                        canv.setStrokeColor(self.font_color)
                        canv.roundRect(bx, by, bw, bh, 6.0, stroke=0, fill=1)
                        canv.setFillColor(colors.white)
                        canv.setFont(self.headline_font, btn_font_size)
                        canv.drawCentredString(cx, by + (bh - btn_font_size) / 2.0 + 2.0, self.cta_text)
                        if self.cta_link:
                            canv.linkURL(self.cta_link, (bx, by, bx + bw, by + bh), relative=1)
                finally:
                    canv.restoreState()

        marketing_banner_flowable = MarketingBannerFlowable(
            marketing_headline_text,
            marketing_message_text,
            marketing_cta_text,
            marketing_cta_link,
            marketing_font_color,
            marketing_background_color,
            marketing_background_image,
            marketing_background_image_opacity,
            marketing_headline_font,
            marketing_body_font,
            marketing_has_underline,
        )

    # Build story
    story: List[Any] = []
    available_width = max(A4_WIDTH - left_margin - right_margin, 100.0)

    header_flowables: List[Any] = [para(org_or_from, brand_style)]
    if invoice_title_text:
        header_flowables.append(Spacer(1, 4))
        header_flowables.append(Paragraph(escape(invoice_title_text), invoice_title_style))

    header_added = False
    if logo_flowable:
        header_block = _StackedFlowable(header_flowables) if header_flowables else None
        if logo_alignment in ('center', 'centre', 'middle'):
            logo_flowable.hAlign = 'CENTER'
            story.append(logo_flowable)
            story.append(Spacer(1, 10))
            if header_flowables:
                story.extend(header_flowables)
                header_added = True
        elif header_block:
            logo_flowable.hAlign = 'LEFT'
            logo_width = float(getattr(logo_flowable, 'drawWidth', 0.0) or 0.0)
            logo_column_width = min(logo_width + 8.0, available_width * 0.5)
            logo_column_width = max(logo_column_width, 48.0)
            text_column_width = available_width - logo_column_width
            if text_column_width < 60.0:
                text_column_width = 60.0
                logo_column_width = max(available_width - text_column_width, 48.0)
            if logo_alignment in ('right', 'end'):
                logo_flowable.hAlign = 'RIGHT'
                table_data = [[header_block, logo_flowable]]
                col_widths = [text_column_width, logo_column_width]
            else:
                logo_flowable.hAlign = 'LEFT'
                table_data = [[logo_flowable, header_block]]
                col_widths = [logo_column_width, text_column_width]
            heading_table = Table(table_data, colWidths=col_widths, hAlign='LEFT')
            table_style = [
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('LEFTPADDING', (0, 0), (-1, -1), 0),
                ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                ('TOPPADDING', (0, 0), (-1, -1), 0),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
            ]
            if logo_alignment in ('right', 'end'):
                table_style.extend([
                    ('ALIGN', (0, 0), (0, -1), 'LEFT'),
                    ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
                ])
            else:
                table_style.extend([
                    ('ALIGN', (0, 0), (0, -1), 'LEFT'),
                    ('ALIGN', (1, 0), (1, -1), 'LEFT'),
                ])
            heading_table.setStyle(TableStyle(table_style))
            story.append(heading_table)
            header_added = True
        else:
            story.append(logo_flowable)
    if not header_added and header_flowables:
        story.extend(header_flowables)

    story.append(Spacer(1, 6))
    story.append(Paragraph('INVOICE', ParagraphStyle('Sublabel', parent=styles['Normal'], alignment=1, fontName='Helvetica-Bold', fontSize=12, textColor=font_color)))
    story.append(HRFlowable(width='100%', thickness=0.75, color=divider, spaceBefore=6, spaceAfter=10))

    # Meta/details table
    details_left = [
        para('Invoice #', label_style), para(invoice_id, value_style),
        para('Invoice date', label_style), para(issue_date_human, value_style),
        para('Due date', label_style), para(due_date_human, value_style),
    ]
    meta_right = [
        para('Payment term', label_style), para(payment_term, value_style),
        para('PO number', label_style), para(po_number, value_style),
        para('Currency', label_style), para(currency, value_style),
    ]
    details_tbl = Table([[details_left, meta_right]], colWidths=[80*mm, 80*mm])
    details_tbl.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('BOX', (0,0), (-1,-1), 0.25, divider),
    ]))
    story.append(details_tbl)
    story.append(Spacer(1, 8))

    # Parties block
    def party_block(title: str, name: str, email: str, addr: str) -> List[Any]:
        out: List[Any] = []
        out.append(para(title, label_style))
        out.append(para(name or 'N/A', value_style))
        if email:
            out.append(para(email, small_style))
        if addr:
            for line in addr.splitlines():
                out.append(para(line, small_style))
        return out

    left_block = party_block('Bill To', to_name, to_email, to_address)
    right_block = party_block('From', org_or_from, from_email, from_address)
    parties_tbl = Table([[left_block, right_block]], colWidths=[80*mm, 80*mm])
    parties_tbl.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(parties_tbl)
    story.append(Spacer(1, 12))

    # Items table
    def _to_dec(v, default=Decimal('0')) -> Decimal:
        try:
            return Decimal(str(v))
        except Exception:
            return Decimal(default)

    data_rows: List[List[Any]] = []
    header_style = ParagraphStyle('th', parent=small_style, fontName='Helvetica-Bold', textColor=font_color)
    header = [Paragraph('Description', header_style), Paragraph('Qty', header_style), Paragraph('Unit Price', header_style), Paragraph('Line Total', header_style)]
    data_rows.append(header)
    valid_count = 0
    calc_subtotal = ZERO
    for it in items:
        desc = str(it.get('description') or '').strip()
        if not desc:
            continue
        qty = _to_dec(it.get('quantity', 0))
        price = _to_dec(it.get('price', 0))
        if qty < 0 or price < 0:
            continue
        line_total = qty * price
        calc_subtotal += line_total
        data_rows.append([
            Paragraph(escape(desc), small_style),
            Paragraph(f"{qty.normalize():f}".rstrip('0').rstrip('.') if '.' in f"{qty}" else f"{qty}", num_right),
            Paragraph(format_currency(price, currency), num_right),
            Paragraph(format_currency(line_total, currency), num_right),
        ])
        valid_count += 1
    if valid_count == 0:
        data_rows.append([Paragraph('No items provided', small_style), Paragraph('-', num_right), Paragraph('-', num_right), Paragraph('-', num_right)])

    subtotal_decimal = _as_decimal(_first(data, 'subtotal', 'subTotal', 'subtotalAmount'), calc_subtotal)
    tax_rate_decimal = _rate_decimal(_first(data, 'tax_rate', 'taxRate', 'taxRateDecimal'))
    vat_rate_decimal = _rate_decimal(_first(data, 'vat_rate', 'vatRate'))
    shipping_rate_decimal = _rate_decimal(_first(data, 'shipping_rate', 'shippingRate'))
    tax_amount_decimal = _as_decimal(_first(data, 'tax_amount', 'taxAmount'), subtotal_decimal * tax_rate_decimal)
    vat_amount_decimal = _as_decimal(_first(data, 'vat_amount', 'vatAmount'), subtotal_decimal * vat_rate_decimal)
    shipping_amount_decimal = _as_decimal(_first(data, 'shipping_amount', 'shippingAmount'), subtotal_decimal * shipping_rate_decimal)
    total_decimal = _as_decimal(
        _first(data, 'total', 'grandTotal', 'totalAmount'),
        subtotal_decimal + tax_amount_decimal + vat_amount_decimal + shipping_amount_decimal,
    )

    items_table = Table(data_rows, colWidths=[70*mm, 25*mm, 30*mm, 35*mm], hAlign='LEFT', repeatRows=1)
    items_table.setStyle(TableStyle([
        ('TEXTCOLOR', (0,0), (-1,0), font_color),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 9),
        ('ALIGN', (1,1), (-1,-1), 'RIGHT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.25, divider),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(items_table)
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width='100%', thickness=0.75, color=divider, spaceBefore=6, spaceAfter=6))

    # Totals
    def _p(s: str) -> Paragraph:
        return Paragraph(escape(s), small_style)
    subtotal_display = format_currency(subtotal_decimal, currency)
    vat_display = format_currency(vat_amount_decimal, currency)
    tax_display = format_currency(tax_amount_decimal, currency)
    shipping_display = format_currency(shipping_amount_decimal, currency)
    total_display = format_currency(total_decimal, currency)
    vat_label = _label_with_percent('VAT', vat_rate_decimal)
    tax_label = _label_with_percent('Tax', tax_rate_decimal)
    shipping_label = _label_with_percent('Shipping', shipping_rate_decimal)

    totals_rows = [
        [_p('Subtotal'), Paragraph(subtotal_display, num_right)],
        [_p(vat_label), Paragraph(vat_display, num_right)],
        [_p(tax_label), Paragraph(tax_display, num_right)],
        [_p(shipping_label), Paragraph(shipping_display, num_right)],
        [Paragraph('Grand Total', ParagraphStyle('gtl', parent=small_style, fontName='Helvetica-Bold', fontSize=13, textColor=font_color)), Paragraph(total_display, ParagraphStyle('gtv', parent=num_right, fontName='Helvetica-Bold', fontSize=14, textColor=font_color))],
    ]
    totals_table = Table(totals_rows, colWidths=[130*mm, 30*mm], hAlign='RIGHT')
    totals_table.setStyle(TableStyle([
        ('ALIGN', (0,0), (0,-1), 'LEFT'),
        ('ALIGN', (1,0), (1,-1), 'RIGHT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LINEABOVE', (0,-1), (-1,-1), 0.5, divider),
    ]))
    story.append(totals_table)
    story.append(Spacer(1, 10))

    # Notes & Terms
    notes_title = Paragraph('NOTES', label_style)
    terms_title = Paragraph('TERMS & CONDITIONS', label_style)
    notes_body = Paragraph(escape(notes).replace('\n', '<br/>') or 'No additional notes.', small_style)
    terms_body = Paragraph(escape(terms).replace('\n', '<br/>') or 'No terms provided.', small_style)
    nt_outer = Table([[notes_title, terms_title], [notes_body, terms_body]], colWidths=[80*mm, 80*mm])
    nt_outer.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(nt_outer)
    if marketing_banner_flowable:
        story.append(Spacer(1, 28))
        story.append(marketing_banner_flowable)
    story.append(Spacer(1, 10))

    # Document assembly
    def _coerce_float(value: Any) -> float:
        try:
            return float(value or 0)
        except Exception:
            return 0.0

    def _measure_space(flowable: Flowable, suffix: str) -> float:
        getter = getattr(flowable, f"getSpace{suffix}", None)
        if callable(getter):
            try:
                return _coerce_float(getter())
            except Exception:
                return 0.0
        attr_name = f"space{suffix}"
        return _coerce_float(getattr(flowable, attr_name, 0))

    available_width = A4_WIDTH - left_margin - right_margin
    total_content_height = 0.0
    for index, flowable in enumerate(story):
        try:
            _, measured_height = flowable.wrap(available_width, 1_000_000)
        except Exception as exc:
            logger.warning(
                "Failed to measure flowable %s (%s); using fallback height: %s",
                index,
                type(flowable).__name__,
                exc,
            )
            measured_height = A4_HEIGHT
        total_content_height += _measure_space(flowable, 'Before')
        total_content_height += _coerce_float(measured_height)
        total_content_height += _measure_space(flowable, 'After')

    safety_padding = 100.0  # extra breathing room to avoid accidental overflow
    dynamic_page_height = max(
        A4_HEIGHT,
        total_content_height + top_margin + bottom_margin + safety_padding,
    )
    dynamic_page = (pagesizes.A4[0], dynamic_page_height)
    logger.debug(
        "Dynamic invoice page height set to %.2f pts for %s flowables",
        dynamic_page_height,
        len(story),
    )

    doc = BaseDocTemplate(
        buffer,
        pagesize=dynamic_page,
        leftMargin=left_margin,
        rightMargin=right_margin,
        topMargin=top_margin,
        bottomMargin=bottom_margin,
        title=(data.get('title') or 'Invoice'),
    )
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id='normal')

    def _on_page(canv, docobj):
        if page_color_hex:
            canv.saveState()
            try:
                canv.setFillColor(page_color)
                canv.rect(0, 0, docobj.pagesize[0], docobj.pagesize[1], stroke=0, fill=1)
            finally:
                canv.restoreState()

    template = PageTemplate(id='normal', frames=[frame], onPage=_on_page)
    doc.addPageTemplates([template])

    # Pre-build check
    n_fl = len(story)
    print(f"Flowables in story before build: {n_fl}")
    if n_fl == 0:
        raise RuntimeError('Empty story: no content sections were added')

    # Build & verify
    doc.build(story)
    buffer.seek(0)
    if len(buffer.getvalue() or b'') == 0:
        raise RuntimeError('Empty PDF output')

import base64
import logging
from datetime import datetime
from decimal import Decimal, InvalidOperation
from io import BytesIO
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
from urllib.error import URLError, HTTPError
from urllib.request import urlopen

from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from markupsafe import escape
from reportlab.lib import colors, pagesizes
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.lib.utils import ImageReader
from reportlab.platypus import (
    BaseDocTemplate,
    Flowable,
    Frame,
    HRFlowable,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

# Optional validation
try:
    from .validation import validate_invoice_data  # type: ignore
except Exception:
    def validate_invoice_data(invoice_data: Dict[str, Any]) -> Optional[str]:
        return None

# ---------------------------------------------------------------------
# Flask setup
# ---------------------------------------------------------------------
app = Flask(__name__)
app.config.setdefault("JSON_SORT_KEYS", False)
CORS(app, resources={r"/*": {"origins": "*"}})

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("invoice")

PDF_STORAGE_DIR = Path(app.root_path) / "pdfs"
PDF_STORAGE_DIR.mkdir(parents=True, exist_ok=True)

print("✅ /generate-pdf route active with clean layout")

# ---------------------------------------------------------------------
# Utility helpers
# ---------------------------------------------------------------------

def mask_email(value: Optional[str]) -> Optional[str]:
    if not isinstance(value, str): return value
    if "@" not in value: return value
    name, domain = value.split("@", 1)
    return f"{name[:2]}***@{domain}"

def sanitize_for_log(payload: Any) -> Any:
    if isinstance(payload, dict):
        return {k: sanitize_for_log(v) for k, v in payload.items()}
    if isinstance(payload, list):
        return [sanitize_for_log(v) for v in payload]
    if isinstance(payload, str) and "@" in payload:
        return mask_email(payload)
    return payload

def to_decimal(value: Any, field: str) -> Decimal:
    try:
        return Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError):
        raise ValueError(f'"{field}" must be a number.')

def get_currency_symbol(code: Optional[str]) -> str:
    return {"USD": "$", "EUR": "€", "GBP": "£", "INR": "₹"}.get((code or "USD").upper(), "$")

def format_currency(value: Any, currency_code: Optional[str] = "USD") -> str:
    try:
        amount = float(value)
    except Exception:
        amount = 0.0
    sym = get_currency_symbol(currency_code)
    return f"{sym}{amount:,.2f}"

def _parse_hex_color(value: Optional[str], default_hex: str) -> colors.Color:
    if not value: return colors.HexColor(default_hex)
    v = value.strip("#").strip()
    if len(v) == 3: v = "".join(c * 2 for c in v)
    if len(v) == 6:
        try:
            return colors.HexColor("#" + v)
        except Exception:
            pass
    return colors.HexColor(default_hex)

DECIMAL_ZERO = Decimal("0")
DECIMAL_ONE = Decimal("1")


def _decimal_from(value: Any, fallback: Decimal = DECIMAL_ZERO) -> Decimal:
    if value is None:
        return fallback
    candidate = value
    if isinstance(candidate, str):
        candidate = candidate.strip()
        if not candidate:
            return fallback
    try:
        return Decimal(str(candidate))
    except (InvalidOperation, TypeError, ValueError):
        return fallback


def _rate_from(value: Any) -> Decimal:
    rate = _decimal_from(value, DECIMAL_ZERO)
    if rate < DECIMAL_ZERO:
        return DECIMAL_ZERO
    if rate > DECIMAL_ONE:
        try:
            rate = rate / Decimal("100")
        except Exception:
            return DECIMAL_ZERO
    return rate


def _quantity_display(value: Decimal) -> str:
    normalized = value.normalize()
    text = f"{normalized:f}"
    if "." in text:
        text = text.rstrip("0").rstrip(".")
    return text or "0"


def _percent_string(rate: Decimal) -> str:
    pct = rate * Decimal("100")
    return f"{pct:.2f}".rstrip("0").rstrip(".")


def _decimal_to_float(value: Decimal) -> float:
    try:
        return float(value)
    except Exception:
        return 0.0


def _build_summary_payload(raw: Dict[str, Any]) -> Dict[str, Any]:
    data = raw if isinstance(raw, dict) else {}
    raw_items = data.get("items") if isinstance(data.get("items"), list) else []
    items: List[Dict[str, Any]] = []
    subtotal = DECIMAL_ZERO

    for entry in raw_items:
        if not isinstance(entry, dict):
            continue
        description = str(entry.get("description") or "").strip()
        if not description:
            continue
        quantity = _decimal_from(entry.get("quantity"), DECIMAL_ZERO)
        price = _decimal_from(entry.get("price"), DECIMAL_ZERO)
        if quantity <= DECIMAL_ZERO or price < DECIMAL_ZERO:
            continue
        line_total = quantity * price
        subtotal += line_total
        items.append(
            {
                "description": description,
                "quantity": quantity,
                "unit_price": price,
                "line_total": line_total,
            }
        )

    tax_rate = _rate_from(data.get("taxRate") or data.get("tax_rate"))
    vat_rate = _rate_from(data.get("vatRate") or data.get("vat_rate"))
    shipping_rate = _rate_from(data.get("shippingRate") or data.get("shipping_rate"))

    tax_amount = _decimal_from(
        data.get("taxAmount") or data.get("tax_amount"),
        subtotal * tax_rate,
    )
    vat_amount = _decimal_from(
        data.get("vatAmount") or data.get("vat_amount"),
        subtotal * vat_rate,
    )
    shipping_amount = _decimal_from(
        data.get("shippingAmount") or data.get("shipping_amount"),
        subtotal * shipping_rate,
    )
    total = _decimal_from(
        data.get("total") or data.get("grandTotal"),
        subtotal + tax_amount + vat_amount + shipping_amount,
    )

    currency = str(data.get("currency") or data.get("currencyCode") or "USD").upper()
    invoice_id = str(
        data.get("invoice_id")
        or data.get("invoiceId")
        or data.get("id")
        or data.get("invoiceNumber")
        or "invoice"
    ).strip() or "invoice"
    customer = data.get("customer") if isinstance(data.get("customer"), dict) else {}
    customer_name = str(customer.get("name") or customer.get("fullName") or "").strip()
    customer_email = str(customer.get("email") or customer.get("Email") or "").strip()
    due_date = str(
        data.get("dueDate")
        or data.get("due_date")
        or data.get("due_date_human")
        or data.get("dueDateHuman")
        or ""
    ).strip()
    issue_date = str(
        data.get("issueDate")
        or data.get("issue_date")
        or data.get("issue_date_human")
        or data.get("issueDateHuman")
        or ""
    ).strip()
    from_name = str(
        data.get("from_name")
        or data.get("fromName")
        or data.get("organization_name")
        or data.get("organizationName")
        or ""
    ).strip()

    marketing = data.get("marketing") if isinstance(data.get("marketing"), dict) else {}

    summary = {
        "invoice_id": invoice_id,
        "customer": {
            "name": customer_name,
            "email": customer_email or None,
        },
        "dates": {
            "issue": issue_date or None,
            "due": due_date or None,
        },
        "totals": {
            "currency": currency,
            "subtotal": _decimal_to_float(subtotal),
            "tax": _decimal_to_float(tax_amount),
            "vat": _decimal_to_float(vat_amount),
            "shipping": _decimal_to_float(shipping_amount),
            "total": _decimal_to_float(total),
        },
        "rates": {
            "tax": _percent_string(tax_rate),
            "vat": _percent_string(vat_rate),
            "shipping": _percent_string(shipping_rate),
        },
        "items": [
            {
                "description": entry["description"],
                "quantity": _decimal_to_float(entry["quantity"]),
                "unit_price": _decimal_to_float(entry["unit_price"]),
                "line_total": _decimal_to_float(entry["line_total"]),
            }
            for entry in items
        ],
    }

    totals_display = {
        "subtotal": format_currency(subtotal, currency),
        "tax": format_currency(tax_amount, currency),
        "vat": format_currency(vat_amount, currency),
        "shipping": format_currency(shipping_amount, currency),
        "total": format_currency(total, currency),
    }

    headline = str(data.get("title") or data.get("invoice_title") or "").strip()
    notes = str(data.get("notes") or "").strip()

    summary_line = (
        f"Invoice {invoice_id} for {customer_name or 'your client'} totals "
        f"{totals_display['total']}."
    )
    if due_date:
        summary_line += f" Payment due by {due_date}."

    follow_up_email = None
    if customer_name:
        follow_up_email = (
            f"Hi {customer_name.split()[0]},\n\n"
            f"This is a quick check-in on invoice {invoice_id} for "
            f"{totals_display['total']}. Please let us know if you have any "
            "questions or need anything else to complete payment.\n\n"
            f"Best regards,\n{from_name or 'Your team'}"
        )

    next_step = (
        "Schedule a reminder a few days before the due date to keep your client informed."
    )

    if not items:
        items_rows = (
            "<tr>"
            "<td colspan=\"4\" style=\"padding:12px 16px;border-bottom:1px solid #e5e7eb;"
            "color:#6b7280;\">No line items provided.</td>"
            "</tr>"
        )
    else:
        items_rows = "".join(
            (
                "<tr>"
                f"<td style=\"padding:12px 16px;border-bottom:1px solid #e5e7eb;color:#111827;\">{escape(entry['description'])}</td>"
                f"<td style=\"padding:12px 16px;border-bottom:1px solid #e5e7eb;color:#111827;\">{_quantity_display(entry['quantity'])}</td>"
                f"<td style=\"padding:12px 16px;text-align:right;border-bottom:1px solid #e5e7eb;color:#111827;\">{escape(format_currency(entry['unit_price'], currency))}</td>"
                f"<td style=\"padding:12px 16px;text-align:right;border-bottom:1px solid #e5e7eb;color:#111827;\">{escape(format_currency(entry['line_total'], currency))}</td>"
                "</tr>"
            )
            for entry in items
        )

    marketing_block = ""
    if marketing:
        headline_text = str(marketing.get("headline") or "").strip()
        message_text = str(marketing.get("message") or "").strip()
        cta_text = str(marketing.get("ctaText") or "").strip()
        cta_link = str(marketing.get("ctaLink") or "").strip()
        font_color = str(marketing.get("fontColor") or "#1f2937").strip() or "#1f2937"
        background_color = str(marketing.get("backgroundColor") or "#f3f4f6").strip() or "#f3f4f6"

        if headline_text or message_text or cta_text:
            marketing_block = (
                "<div style=\"margin-top:28px;padding:24px;border-radius:16px;"
                f"background:{escape(background_color)};\">"
                f"<div style=\"color:{escape(font_color)};font-family:Helvetica,Arial,sans-serif;\">"
            )
            if headline_text:
                marketing_block += (
                    f"<h3 style=\"margin:0 0 8px;font-size:20px;font-weight:600;\">"
                    f"{escape(headline_text)}</h3>"
                )
            if message_text:
                marketing_block += (
                    f"<p style=\"margin:0 0 16px;font-size:15px;line-height:22px;\">"
                    f"{escape(message_text)}</p>"
                )
            if cta_text:
                if cta_link:
                    marketing_block += (
                        f"<a href=\"{escape(cta_link)}\" "
                        "style=\"display:inline-block;padding:12px 24px;"
                        f"border-radius:8px;background:{escape(font_color)};color:#ffffff;"
                        "text-decoration:none;font-weight:600;\">"
                        f"{escape(cta_text)}</a>"
                    )
                else:
                    marketing_block += (
                        f"<div style=\"display:inline-block;padding:12px 24px;"
                        f"border-radius:8px;background:{escape(font_color)};color:#ffffff;"
                        "font-weight:600;\">"
                        f"{escape(cta_text)}</div>"
                    )
            marketing_block += "</div></div>"

    html = (
        "<!doctype html>"
        "<html><head><meta charset=\"utf-8\" />"
        f"<title>Invoice {escape(invoice_id)}</title>"
        "</head>"
        "<body style=\"margin:0;padding:0;background:#f9fafb;\">"
        "<div style=\"max-width:640px;margin:0 auto;padding:32px 24px;font-family:"
        "Helvetica,Arial,sans-serif;color:#111827;background:#ffffff;\">"
        f"<h1 style=\"margin-top:0;font-size:24px;font-weight:700;\">{escape(headline or 'Invoice')}</h1>"
        f"<p style=\"margin:0 0 16px;color:#4b5563;\">{escape(summary_line)}</p>"
        "<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" "
        "style=\"border-collapse:collapse;border-radius:12px;overflow:hidden;"
        "border:1px solid #e5e7eb;\">"
        "<thead style=\"background:#f3f4f6;color:#111827;text-align:left;font-size:13px;\">"
        "<tr>"
        "<th style=\"padding:12px 16px;\">Description</th>"
        "<th style=\"padding:12px 16px;\">Qty</th>"
        "<th style=\"padding:12px 16px;text-align:right;\">Unit price</th>"
        "<th style=\"padding:12px 16px;text-align:right;\">Line total</th>"
        "</tr>"
        "</thead>"
        f"<tbody>{items_rows}</tbody>"
        "</table>"
        "<div style=\"margin-top:24px;display:flex;justify-content:flex-end;\">"
        "<table role=\"presentation\" cellspacing=\"0\" cellpadding=\"0\" "
        "style=\"font-size:14px;color:#111827;\">"
        f"<tr><td style=\"padding:4px 16px;color:#6b7280;\">Subtotal</td><td style=\"padding:4px 0;text-align:right;\">{escape(totals_display['subtotal'])}</td></tr>"
        f"<tr><td style=\"padding:4px 16px;color:#6b7280;\">Tax ({_percent_string(tax_rate)}%)</td><td style=\"padding:4px 0;text-align:right;\">{escape(totals_display['tax'])}</td></tr>"
        f"<tr><td style=\"padding:4px 16px;color:#6b7280;\">VAT ({_percent_string(vat_rate)}%)</td><td style=\"padding:4px 0;text-align:right;\">{escape(totals_display['vat'])}</td></tr>"
        f"<tr><td style=\"padding:4px 16px;color:#6b7280;\">Shipping ({_percent_string(shipping_rate)}%)</td><td style=\"padding:4px 0;text-align:right;\">{escape(totals_display['shipping'])}</td></tr>"
        "<tr><td style=\"padding:12px 16px 0;color:#111827;font-weight:700;font-size:16px;\">Total</td>"
        f"<td style=\"padding:12px 0 0;text-align:right;font-weight:700;font-size:18px;\">{escape(totals_display['total'])}</td></tr>"
        "</table>"
        "</div>"
        f"{marketing_block}"
        )  # type: ignore[str-concat]

    if notes:
        html += (
            "<div style=\"margin-top:24px;padding:16px;border-radius:12px;"
            "background:#f3f4f6;color:#374151;\">"
            "<h3 style=\"margin:0 0 8px;font-size:16px;font-weight:600;\">Notes</h3>"
            f"<p style=\"margin:0;font-size:14px;line-height:20px;\">{escape(notes)}</p>"
            "</div>"
        )

    html += "</div></body></html>"

    return {
        "html": html,
        "summary": summary,
        "follow_up_email": follow_up_email,
        "next_step": next_step,
    }

# ---------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------

@app.get("/health")
def health():
    return jsonify({"status": "ok", "service": "invoice-api"})

@app.post("/summary")
def summary():
    payload = request.get_json(force=True, silent=True) or {}
    summary_source = payload.get("data") if isinstance(payload.get("data"), dict) else payload
    if not isinstance(summary_source, dict):
        return jsonify({"status": "error", "message": "Invoice payload must be a JSON object."}), 400

    normalized = dict(summary_source)
    marketing_payload = payload.get("marketing")
    if isinstance(marketing_payload, dict):
        normalized.setdefault("marketing", marketing_payload)

    validation_error = validate_invoice_data(normalized)
    if validation_error:
        return jsonify({"status": "error", "message": validation_error}), 400

    try:
        summary_payload = _build_summary_payload(normalized)
        logger.info(
            "Invoice summary generated for invoice_id=%s items_count=%s total=%s",
            normalized.get("invoice_id")
            or normalized.get("invoiceId")
            or normalized.get("id")
            or "n/a",
            len(summary_payload.get("summary", {}).get("items", [])),
            summary_payload.get("summary", {}).get("totals", {}).get("total"),
        )
        logger.debug(
            "Summary payload snapshot: %s",
            sanitize_for_log(summary_payload.get("summary", {})),
        )
        return jsonify(summary_payload)
    except Exception as exc:
        logger.exception("Failed to build invoice summary: %s", exc)
        return jsonify({"status": "error", "message": "Failed to generate summary"}), 500

@app.post("/generate-pdf")
def generate_pdf():
    payload = request.get_json(force=True, silent=True) or {}
    try:
        normalized_raw = payload.get("data", payload)
        if not isinstance(normalized_raw, dict):
            raise ValueError("Invoice payload must be a JSON object.")
        normalized = dict(normalized_raw)
        marketing_payload = payload.get("marketing")
        if isinstance(marketing_payload, dict):
            normalized.setdefault("marketing", marketing_payload)

        font_override = payload.get("fontColor") or payload.get("font_color")
        if isinstance(font_override, str):
            font_override = font_override.strip() or None
        else:
            font_override = None

        page_override = payload.get("pageColor") or payload.get("page_color")
        if isinstance(page_override, str):
            page_override = page_override.strip() or None
        else:
            page_override = None

        top_level_keys = sorted(normalized.keys())
        logger.info("Incoming top-level keys: %s", top_level_keys)
        items_preview = normalized.get("items")
        if isinstance(items_preview, list):
            items_count = len(items_preview)
        else:
            items_count = 0
        logger.info(
            "Starting final PDF build with invoice_id=%s items_count=%s currency=%s",
            normalized.get("invoice_id")
            or normalized.get("invoiceId")
            or "N/A",
            items_count,
            normalized.get("currency") or normalized.get("currencyCode") or "USD",
        )
        logger.debug("Payload snapshot: %s", sanitize_for_log(normalized))
        validate_invoice_data(normalized)
        buffer = BytesIO()
        build_invoice_pdf(
            buffer,
            normalized,
            font_color_str=font_override,
            page_color_str=page_override,
        )
        filename = f"{normalized.get('invoice_id','invoice')}.pdf"
        path = PDF_STORAGE_DIR / filename
        path.write_bytes(buffer.getvalue())
        return send_file(BytesIO(buffer.getvalue()), as_attachment=True,
                         mimetype="application/pdf", download_name=filename)
    except Exception as e:
        logger.exception("PDF generation failed")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.get("/download/<invoice_id>")
def download(invoice_id: str):
    filename = f"{invoice_id}.pdf" if not invoice_id.endswith(".pdf") else invoice_id
    p = PDF_STORAGE_DIR / filename
    if not p.exists():
        return jsonify({"status": "error", "message": "PDF not found"}), 404
    return send_file(p, mimetype="application/pdf", as_attachment=True, download_name=p.name)

@app.get("/invoices")
def list_invoices():
    pdfs = [p for p in PDF_STORAGE_DIR.glob("*.pdf")]
    return jsonify({
        "status": "ok",
        "count": len(pdfs),
        "items": [{"filename": p.name, "size": p.stat().st_size,
                   "modified_at": datetime.fromtimestamp(p.stat().st_mtime).isoformat()} for p in pdfs]
    })
