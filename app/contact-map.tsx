'use client';
import {useState} from 'react';
import {MapPin} from 'lucide-react';
export function ContactMap({city}:{city:string}){const [open,setOpen]=useState(false);return <div className="ab-contact-map">{open?<iframe title={'Mapa de '+city} src={'https://maps.google.com/maps?q='+encodeURIComponent(city)+'&output=embed'} loading="lazy" referrerPolicy="no-referrer"/>:<button type="button" onClick={()=>setOpen(true)}><MapPin size={36}/><strong>{city}</strong><span>Carregar mapa</span><small>O mapa é fornecido pelo Google Maps.</small></button>}</div>}
