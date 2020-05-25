
document.addEventListener('DOMContentLoaded', () => {

  // console.log('IronGenerator JS imported successfully!');
}, false);

let changeStatus = () => {
  document.getElementById('addButton').innerText = date()
  axios.post('/addCamera')
}
