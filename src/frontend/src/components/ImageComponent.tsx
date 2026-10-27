import { getImageFromStorage } from '../storage/imageStorage';

interface ImageComponentProps {
  src: string;
  className?: string;
  alt?: string;
}

function ImageComponent({ src, className, alt = '' }: ImageComponentProps) {
  const base64 = getImageFromStorage(src);

  if (!base64) {
    return <div className={className} style={{ background: '#eef1f4' }} />;
  }

  return <img src={base64} className={className} alt={alt} />;
}

export default ImageComponent;