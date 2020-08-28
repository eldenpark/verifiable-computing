const AWS = require('aws-sdk');
const { logger } = require('jege/server');

const log = logger('[randgen]');

AWS.config.update({ region: 'us-west-2' });

const db = new AWS.DynamoDB();

async function write()
{
  const now = Date.now().toString();
  const params = {
    Item: {
      id: {
        S: now,
      },
      updated_at: {
        S: now,
      },
    },
    TableName: 'work_history',
  };

  return new Promise((resolve, reject) => {
    db.putItem(params, function(err, data)
    {
      if (err) {
        log('write(): err: %s', err);
        reject();
      } else {
        log('write(): completed writing, now: %s', now);
        resolve();
      }
    });
  })
}


(async function main()
{
  await write();
  return 1;
})();
