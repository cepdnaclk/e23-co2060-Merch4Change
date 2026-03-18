import React, { useEffect, useState } from 'react';
import './About.css';

function Team() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const teamMembers = [
    { name: 'Sarah Jenkins', role: 'Founder & CEO', icon: '👩‍💼' },
    { name: 'Mark Robertson', role: 'Head of Partnerships', icon: '👨‍💼' },
    { name: 'Aisha Patel', role: 'Community Director', icon: '👩‍💻' },
    { name: 'David Chen', role: 'Lead Developer', icon: '👨‍💻' },
  ];

  return (
    <div className={`about-page ${isVisible ? 'animate-in' : ''}`}>
      <div className="about-hero team-hero">
        <h1>Meet the Team</h1>
        <p>The passionate individuals driving Merch4Change.</p>
      </div>

      <div className="about-content">
        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <div key={index} className={`team-card slide-up delay-${index + 1}`}>
              <div className="team-avatar">{member.icon}</div>
              <h3>{member.name}</h3>
              <p>{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Team;
