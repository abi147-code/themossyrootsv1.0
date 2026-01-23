'use client';

import React from 'react';
import { Review } from '../types';
import { Reveal } from './ui/Reveal';
import { Star } from 'lucide-react';

const ReviewCard: React.FC<{ review: Review; index: number }> = ({ review, index }) => (
  <Reveal delay={index * 0.2} type="fade" className="w-full">
    <div className="p-8 md:p-12 h-full flex flex-col items-center text-center border border-transparent hover:border-jaleo-black/5 transition-colors duration-1000 bg-white/60 md:bg-transparent rounded-2xl md:rounded-none shadow md:shadow-none">
      <div className="flex gap-1 mb-6 text-jaleo-gold">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={12} fill="currentColor" strokeWidth={0} />
        ))}
      </div>
      <p className="font-serif text-lg md:text-xl text-jaleo-black leading-loose italic mb-8 font-light opacity-80">
        “{review.text}”
      </p>
      <div className="w-8 h-[1px] bg-jaleo-gold mb-4 opacity-50"></div>
      <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-jaleo-black/40">
        {review.author}
      </span>
    </div>
  </Reveal>
);

const Reviews: React.FC = () => {
  const reviews: Review[] = [
    { 
      author: "Charles Henry", 
      rating: 5, 
      text: "Une adresse comme on en croise trop rarement. Jaleo, c’est la Catalogne qui chante dans l’assiette. Chaque plat respire le soleil, l’huile d’olive, et cette générosité du Sud qu’on ne triche pas. Un vrai moment de bonheur culinaire." 
    },
    { 
      author: "Fred Dupuis", 
      rating: 5, 
      text: "Je n’avais jamais plus mangé une bonne paella en France. Le meilleur Espagnol de l’Ouest. Bravo, nous avons adoré tous les plats, la déco sans prétention, le service agréable et familial. Belle carte des vins." 
    },
    { 
      author: "Everything Elle Knows", 
      rating: 5, 
      text: "Great atmosphere, love the style of the menu and the decor. All the recipes are original, very authentic but with a twist that gives them even more flavor. Definitely a place to try with friends." 
    },
  ];

  return (
    <section className="py-32 bg-jaleo-stone px-4 md:px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 md:divide-x divide-jaleo-black/5">
          {reviews.map((r, i) => (
            <ReviewCard key={i} review={r} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reviews;
