// * 2 3 8 2
export default async function cron({ text }) {
  const filename = this.stack[0].filename;
  const cronId = Math.round(Math.random() * 100000000) 

  const script = `npx tune-sdk --filename=${filename} --user "the cron ${cronId} is up" --save`
  `(crontab -l; echo "${text} ${script}") | crontab -`
  return `crontask id ${cronId} is scheduled`
}
