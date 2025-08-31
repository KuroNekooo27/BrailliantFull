import { Route } from "react-router-dom";

import AdminHome from '../pages/admin/admin home/components/AdminHome';
import ManageLibrary from '../pages/admin/manage library/components/ManageLibrary';
import ManageAccounts from '../pages/admin/manage accounts/components/ManageAccounts';
import ContentRequest from '../pages/admin/content request/components/ContentRequest';
import AdminUploadBooks from '../pages/admin/admin upload books/components/AdminUploadBooks';
import AdminCreateAccount from '../pages/admin/admin create account/components/AdminCreateAccount';
import AdminViewBook from '../pages/admin/admin view book/components/AdminViewBook';
import AdminViewReal from '../pages/admin/admin view real/components/AdminViewReal';
import AdminCreateAccountTempt from '../pages/admin/admin create temporary/components/AdminCreateAccountTempt';
import AdminEditUser from '../pages/admin/admin edit user/components/AdminEditUser';
import AuditTrail from '../pages/admin/audit trail/components/AuditTrail';

export const AdminRoutes = (
    <>
        <Route path='/admin/home' element={<AdminHome />}></Route>
        <Route path='/admin/library' element={<ManageLibrary />}></Route>
        <Route path='/admin/accounts' element={<ManageAccounts />}></Route>
        <Route path='/admin/content-request' element={<ContentRequest />}></Route>
        <Route path='/admin/upload-book' element={<AdminUploadBooks />}></Route>
        <Route path='/admin/create-account' element={<AdminCreateAccountTempt />}></Route>
        <Route path='/admin/approval/book' element={<AdminViewBook />}></Route>
        <Route path='/admin/view/book' element={<AdminViewReal />}></Route>
        <Route path='/admin/edit-account' element={<AdminEditUser />}></Route>
        <Route path='/admin/audit-trail' element={<AuditTrail />}></Route>
        <Route path='/admin/create/account' element={<AdminCreateAccount />}></Route>
    </>
);
