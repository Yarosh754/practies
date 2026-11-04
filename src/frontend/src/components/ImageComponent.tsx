import { useState } from 'react';
import { getImageUrl } from '../api/helpers';
import './ImageComponent.css';

interface ImageComponentProps {
  src: string;
  className?: string;
  alt?: string;
}

function ImageComponent({ src, className = '', alt = '' }: ImageComponentProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = failedSrc === src;

  if (!src || failed) {
    return (
      <div className={`image-component-placeholder ${className}`.trim()} aria-hidden="true"/>
    );
  }

  return (
    <img src={getImageUrl(src)} className={className} alt={alt} loading="lazy"onError={() => setFailedSrc(src)}
    />
  );
}

export default ImageComponent;