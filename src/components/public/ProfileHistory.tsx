import {professionalProfile as profile} from '@/data/profile';
export function ProfileHistory(){return <>
 <section><h2>Education</h2>{profile.education.map(item=><div key={item.qualification}><h3>{item.qualification}</h3><p>{item.institution} · {item.dates}</p></div>)}</section>
 <section><h2>Work experience</h2>{profile.experience.map(item=><div key={item.organization}><h3>{item.role} — {item.organization}</h3><p>{item.dates}</p><ul>{item.items.map(text=><li key={text}>{text}</li>)}</ul></div>)}</section>
 <section><h2>Leadership experience</h2>{profile.leadership.map(item=><div key={item.role}><h3>{item.role}</h3><p>{item.organization}</p><ul>{item.items.map(text=><li key={text}>{text}</li>)}</ul></div>)}</section>
 <section><h2>Certifications</h2><ul>{profile.certifications.map(item=><li key={item.name}>{item.name} — {item.issuer}, {item.date}</li>)}</ul></section>
 <section><h2>Volunteering</h2><p>{profile.volunteering}</p></section>
 </>;}
