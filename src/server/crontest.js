var CronJob = require('cron').CronJob;

//https://www.npmjs.com/package/cron

/* Runs every sec */
new CronJob('* * * * * *', function () {
    console.log('You will see this message every second');
}, null, true, 'America/Los_Angeles');


/* called automatically at 12:52 Mon - Fri */
var job = new CronJob('00 52 12 * * 1-5', function() {
  /*
   * Runs every weekday (Monday through Friday)
   * at 12:52:00 AM. It does not run on Saturday
   * or Sunday.
   */
  console.log('cron called')
  }, function () {
    /* This function is executed when the job stops */
    console.log('cron stopped')
  },
  true, /* Start the job right now */
  'Asia/Kolkata' /* Time zone of this job. */
);

var job = new CronJob({
    cronTime: '00 54 12 * * 1-5',
    onTick: function() {
      /*
       * Runs every weekday (Monday through Friday)
       * at 12:53:00 AM. It does not run on Saturday
       * or Sunday.
       */
      console.log('calllllllling')
    },
    start: false,
    timeZone: 'Asia/Kolkata'
  });
  job.start();

