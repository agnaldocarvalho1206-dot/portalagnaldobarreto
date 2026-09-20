'use client';
import {Accordion,AccordionItem,AccordionTrigger,AccordionContent} from '../components/ui/accordion';
import {serviceFaq} from './services-data';
export function ServicesFAQ(){return <Accordion type="single" collapsible className="ab-services-faq-list">{serviceFaq.map(([question,answer],i)=><AccordionItem key={question} value={'faq-'+i}><AccordionTrigger>{question}</AccordionTrigger><AccordionContent><p>{answer}</p></AccordionContent></AccordionItem>)}</Accordion>}

export function ServiceMore({title,problem,features,tech,quoteUrl}:{title:string,problem:string,features:string[],tech:string,quoteUrl:string}){return <Accordion type="single" collapsible className="ab-service-more"><AccordionItem value="details"><AccordionTrigger><span>Saiba mais<span className="sr-only"> sobre {title}</span></span></AccordionTrigger><AccordionContent><p>{problem}</p><h4>Recursos possíveis</h4><ul>{features.map(f=><li key={f}>{f}</li>)}</ul><p className="ab-service-technologies">{tech}</p><a className="button" href={quoteUrl}>Solicitar orçamento</a></AccordionContent></AccordionItem></Accordion>}
