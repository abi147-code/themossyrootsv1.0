export type DemoEventProps = {
  client_slug: string;
  [key: string]: unknown;
};

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export function getDeviceType(): DeviceType {
  if (typeof window === 'undefined') {
    return 'desktop';
  }

  const width = window.innerWidth;

  if (width < 768) {
    return 'mobile';
  }

  if (width < 1024) {
    return 'tablet';
  }

  return 'desktop';
}

export function pushDemoEvent(event: string, payload: DemoEventProps) {
  if (typeof window === 'undefined') {
    return;
  }

  const win = window as typeof window & {
    dataLayer?: DemoEventProps[];
  };

  win.dataLayer = win.dataLayer ?? [];
  win.dataLayer.push({ event, ...payload });
}
