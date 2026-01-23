'use client';

import React from 'react';
import { Reveal } from './ui/Reveal';

const Location: React.FC = () => {
  return (
    <section className="w-full h-[50vh] min-h-[400px] relative overflow-hidden bg-jaleo-stone">
      <div className="w-full h-full relative z-0 group">
        <iframe
          width="100%"
          height="100%"
          id="gmap_canvas"
          src="https://maps.google.com/maps?q=33%20Place%20Jean%20Mac%C3%A9%2C%2044100%20Nantes&t=&z=15&ie=UTF8&iwloc=&output=embed"
          frameBorder="0"
          scrolling="no"
          title="Location Map"
          className="w-full h-full grayscale contrast-[1.1] group-hover:grayscale-0 group-hover:contrast-100 transition-all duration-[2000ms] ease-in-out"
        ></iframe>

        <div className="absolute inset-0 bg-jaleo-stone/10 pointer-events-none group-hover:opacity-0 transition-opacity duration-1000" />
      </div>
    </section>
  );
};

export default Location;
