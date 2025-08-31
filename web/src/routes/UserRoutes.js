import { Route } from "react-router-dom";

import LandingPage from '../pages/user/landing page/components/LandingPage';
import Home from '../pages/user/home/components/Home';
import Library from '../pages/user/library/components/Library';
import ClassSettings from '../pages/user/class settings/components/ClassSettings';
import UploadBooks from '../pages/user/upload/components/UploadBooks';
import TextToBraille from '../pages/user/text-to-braille/components/TextToBraille';
import Profile from '../pages/user/profile/components/Profile';
import DeviceSettings from '../pages/user/devide settings/components/DeviceSettings';
import Analytics from '../pages/user/analytics/components/Analytics';
import EditSection from '../pages/user/edit section/components/EditSection';
import CreateSection from '../pages/user/create section/components/CreateSection';
import AddStudent from '../pages/user/add student/components/AddStudent';
import ViewStudent from '../pages/user/view student/components/ViewStudent';
import EditProfile from '../pages/user/edit user/components/EditProfile';
import BookDetails from '../pages/user/book details/components/BookDetails';
import BookSession from '../pages/user/book session/components/BookSession';
import AccountActivation from '../pages/user/account activation/components/AccountActivation';
import EditStudent from '../pages/user/edit student/components/EditStudent';
import Grade1 from '../pages/user/braille/grade 1/Grade1';
import Grade2 from '../pages/user/braille/grade 2/Grade2';
export const UserRoutes = (
    <>
        <Route path="/" element={<LandingPage />} />
        <Route path='/home' element={<Home />}></Route>
        <Route path='/library' element={<Library />}></Route>
        <Route path='/class' element={<ClassSettings />}></Route>
        <Route path='/upload' element={<UploadBooks />}></Route>
        <Route path='/text-to-braille' element={<TextToBraille />}></Route>
        <Route path='/profile' element={<Profile />}></Route>
        <Route path='/device-settings' element={<DeviceSettings />}></Route>
        <Route path='/analytics' element={<Analytics />}></Route>
        <Route path='/section/edit' element={<EditSection />}></Route>
        <Route path='/section/create' element={<CreateSection />}></Route>
        <Route path='/student/add' element={<AddStudent />}></Route>
        <Route path='/student/view' element={<ViewStudent />}></Route>
        <Route path='/edit/profile' element={<EditProfile />}></Route>
        <Route path='/book/detail' element={<BookDetails />}></Route>
        <Route path='/book/session' element={<BookSession />}></Route>
        <Route path='/braille/1' element={<Grade1 />}></Route>
        <Route path='/braille/2' element={<Grade2 />}></Route>
        <Route path='/student/edit' element={<EditStudent />}></Route>
        <Route path='/account-activation' element={<AccountActivation />}></Route>
    </>
);