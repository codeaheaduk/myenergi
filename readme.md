# MyEnergi-App-Api

Thanks for twonk https://github.com/twonk/MyEnergi-App-Api for the details on the API.

The first version of this just returns the usage data from the Eddie... to be updated with more features.

## Eddie Data

Import the package and create a new object with the serial number of the hub along with password.

Init a new myEnergi and provide a callback function for the eddie data.

An optional refresh interval can be added to the eddie callback from more frequent requests.

```javascript
const myEnergi = require('myenergi');

const myenrgy = new myEnergi('1234567', 'xxxx');
myenrgy.init().then(() => {
	myenrgy.eddieCallback(callback);
});

function callback (data) {
	console.log(data);
}
```

A JSON response is returned.
* date : Date of reading
* time : Time of reading
* grid : import from grid watts 
* generation : current generation from solar
* frequency : grid frequency
* volatage : grid volatage
* exccess : current excess power being diverted
* consumption : current house consumption

```
{
  date: '23-03-2020',
  time: '12:18:05',
  grid: 8,
  generation: 2873,
  frequency: 49.93,
  volatage: 246.8,
  exccess: 1153,
  consumption: 2881
}
```
