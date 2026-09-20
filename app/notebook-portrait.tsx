import type {ImgHTMLAttributes} from 'react';

export function NotebookPortrait({className='',alt,...props}:ImgHTMLAttributes<HTMLImageElement>){
  return <span className={`${className} notebook-photo`}>
    <img {...props} className="notebook-photo-base" alt={alt}/>
    <img className="notebook-ab-logo" src="/ab-transparent.png" alt="" aria-hidden="true" width={1254} height={1254}/>
  </span>;
}
