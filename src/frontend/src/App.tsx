import {Routes, Route} from 'react-router-dom';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Account from './pages/Account';
import Header from './components/Header';
import AdMain from './pages/AdMain';
import MyAds from './pages/MyAds';
import CreateAd from './pages/CreateAd';
import Moderate from './pages/Moderate';
import Notifications from './pages/Notifications';
import Messenger from './pages/Messenger';

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path='/' element={<Home />}/>
        <Route path='/auth' element={<Auth />}/>
        <Route path='/account' element={<Account />}/>
        <Route path='/adMain/:id' element={<AdMain />} />
        <Route path='/myAds' element={<MyAds />} />
        <Route path='/createad' element={<CreateAd />} />
        <Route path='/createad/:id' element={<CreateAd />} />
        <Route path='/moderate' element={<Moderate />} />
        <Route path='/notifications' element={<Notifications />} />
        <Route path='/messenger' element={<Messenger />} />
      </Routes>
    </>
  )
}

export default App