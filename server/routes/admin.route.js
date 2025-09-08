const AdminController = require('../controllers/admin.controller')

module.exports = app => {
    app.get('/api/alladmins', AdminController.findAllAdmin)
    app.get('/api/test', AdminController.testconnection)
    app.post('/api/newadmin', AdminController.createAdmin)
    //app.get('/api/user/user/:namex', AdminController.findUserByName)
    app.put('/api/update/admin/:id', AdminController.updateAdmin)
    //app.delete('/api/delete/user/:id', AdminController.deleteUser)
    app.get('/api/admin/teacher-recent-activity', AdminController.getRecentTeacherActivity)
    app.get('/api/admin/pending-request', AdminController.getPendingBookRequests)

}