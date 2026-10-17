import './AdComponent.css'
import Favorites from './Favorites';

interface AdComponent{
  adId: string;
  title: string;
  price: number;
  image: string;
  location: string;
  date: string;
}

function AdComponent({adId,title,price,image,location,date,}: AdComponent){

  return (
    <div className='adComponent-main-container'>
        <div className='adComponent-image'>
            <div className='adComponent-heart'>
                <Favorites adId={adId} />
            </div>
            <img src={image} className="adComponent-img" alt="" />
        </div>
        <div className='adComponent-info'>
            <div className='adComponent-price'>
                <p className='p-adComponent-price'>{price} $</p>
            </div>
            <div className='adComponent-name'>
                <p className='p-adComponent-name'>{title}</p>
            </div>
            <div className='adComponent-location'>
                <p className='p-adComponent-location'>{location}</p>
            </div>
            <div className='adComponent-date'>
                <p className='p-adComponent-date'>{date}</p>
            </div>
            <div>
                <button type='button' className='adComponent-button'>Перейти</button>
            </div>
        </div>
    </div>
  )
}

export default AdComponent