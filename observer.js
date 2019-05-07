const axios = require('axios');
const moment = require('moment');


function observer() {
    const minutes = .25;
    // conversion from milliseconds -> seconds
    const interval = minutes * 60 * 1000;
    setInterval(function() {
        console.log('Interval ', moment().format());
        checkTweets();
    }, interval);
}

async function checkTweets() {
    try {
        axios.get('{get_unposted_tweets_url}')
            .then( response => {
                let tweet_array = response.data;
                
                // sort tweets from earliest -> latest post time
                tweets.sort(function(a,b) {
                    a = new moment(a.desiredTime);
                    b = new moment(b.desiredTime);
                    return a - b
                });
                
                for (let tweet in tweets) {
                    const lowerBuffer = moment().subtract(5, 'm');
                    const upperBuffer = moment().add(.5, 'm');
                    const postTime = new moment(tweet_array[tweet].desiredTime);
                    
                    // tweet!
                    if (postTime.isBefore(upperBuffer) && postTime.isAfter(lowerBuffer)) {
                        try {
                            axios.post('{post_tweet_url}',
                                {
                                    content: tweet_array[tweet].content,
                                    desiredTime: tweet_array[tweet].desiredTime,
                                    accountId: tweet_array[tweet].accountId
                                }
                            ).then(response => {
                                // update post in DB
                                axios.put({mark_tweet_posted_url} + tweet_array[tweet].accountId)
                            });
                        } catch(e) {
                            console.error("Error when tweeting: ", e)
                        }
                    }
                }
            })
            
            .catch( error => {
                console.error(error);
            });
            
    } catch (error) {
        console.error(error);
        return error;
    }


}


module.exports = observer;
