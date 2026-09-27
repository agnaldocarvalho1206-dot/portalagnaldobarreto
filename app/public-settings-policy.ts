export type PublicTestimonial={
  name:string;
  company:string;
  project:string;
  quote:string;
  approved:true;
};

function safeText(value:unknown){
  return typeof value==='string'?value.trim():'';
}

export function publicSettingsView(input:unknown){
  const source=input&&typeof input==='object'&&!Array.isArray(input)
    ? input as Record<string,unknown>
    : {};

  const projects=safeText(source.projects);
  const clients=safeText(source.clients);
  const satisfaction=safeText(source.satisfaction);
  const experience=safeText(source.experience);

  const testimonials=Array.isArray(source.testimonials)
    ? source.testimonials
        .slice(0,12)
        .filter((item):item is Record<string,unknown>=>Boolean(item)&&typeof item==='object'&&!Array.isArray(item))
        .filter(item=>item.approved===true)
        .map(item=>({
          name:safeText(item.name),
          company:safeText(item.company),
          project:safeText(item.project),
          quote:safeText(item.quote),
          approved:true as const,
        }))
        .filter(item=>item.name&&item.quote)
    : [];

  return {
    ...source,
    projects,
    clients,
    satisfaction,
    experience,
    metricsConfirmed:source.metricsConfirmed===true&&[projects,clients,satisfaction,experience].every(Boolean),
    testimonials,
  };
}
