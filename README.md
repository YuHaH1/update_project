Refresh the page when the page is updated

#  Usage
~~~ javaScript
import Updator/{ proxyUpdater }  from './lib/bundle.js'
const instance = new Updator({ time: 5000, url: '/',cb:()=>{} })
~~~
**time：**Specify how often to check the file
**url:** Specify where to check the file
**cb:** Callback function when the file is changed. When the file is changed will refresh the page
Suggest to set a cb ,eg open a Confirm box
when you set instance.stop = true , will stop the work untile instance.stop = false
