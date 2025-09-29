const AnalyticsController = require('../controllers/analytics.controller')

module.exports = app => {

    app.get('/reads-per-section/:id', AnalyticsController.getReadsPerSection)
    app.get('/top-books-avg', AnalyticsController.getTopBooksWithAvgTime);
    app.get('/participation-rate/:id', AnalyticsController.getSectionParticipation);
    app.post("/summarize-progress", AnalyticsController.summarizeBookProgress);

}   