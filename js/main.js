let homepage = document.getElementById('homePage');
let cardsPage = document.getElementById('cardsPage');
let cardsList = document.querySelector('#cardsList');
let form = document.getElementById('formSignIn');
let inputField = document.getElementById('name');
let footer = document.getElementById('footer');
let small = document.querySelector('.small');
let welcomeMsg = document.querySelector('.welcomeMsg');
let btnSignOut = document.querySelector('.signOut');
let loader = document.getElementById('loader');
let searchName = document.getElementById('nameSearch');
let selectColor = document.getElementById('colors');
let selectTypes = document.getElementById('types');
let btnSort = document.querySelector('.btnSort');
let btnLoadMore = document.querySelector('.loadMore');
let userName; // User name from input field
let dataArr = []; // all data from API
let loadArr = [];
let typesArr = [];
let n = 8;
let btnToTop = document.querySelector('.toTop');
let root = document.documentElement;

// Function for drawing card
function drawCard(card) {
	let cardHolder = document.createElement('div');
	cardHolder.classList.add('card');

	let backCard = document.createElement('div');
	backCard.classList.add('backCard');
	cardHolder.appendChild(backCard);
	// There are no images for all cards (no imageUrl)
	let image = document.createElement("img");
	backCard.appendChild(image);
	if (card.imageUrl == undefined) {
		image.setAttribute("src", "assets/arena.jpg");
	} else {
		image.setAttribute("src", card.imageUrl);
	};

	let frontCard = document.createElement('div');
	frontCard.classList.add('frontCard');
	cardHolder.appendChild(frontCard);

	let nameC = document.createElement('h3');
	nameC.innerText = card.name;
	nameC.classList.add('h3-title');
	frontCard.appendChild(nameC);

	let artist = document.createElement('p');
	artist.innerHTML = `<p>Artist: ${card.artist}</p>`;
	artist.classList.add('artist');
	frontCard.appendChild(artist);

	let types = document.createElement('p');
	types.innerText = (card.types) ? card.types.join(', ') : null;
	frontCard.appendChild(types);

	let set = document.createElement('p');
	set.innerText = card.setName;
	frontCard.appendChild(set);

	let colors = document.createElement('p');
	colors.innerText = (card.colors) ? card.colors.join(', ') : null;
	frontCard.appendChild(colors);

	return cardHolder;
};

// For each element in the specified array, draw a card 
function renderCardList(arrAny) {
	arrAny.forEach((card) => {
		let newCard = drawCard(card); // invoke drawCard() here
		cardsList.appendChild(newCard);
	});
};

// Showing Loader while fetching data
function showLoader() {
	loader.className = 'show';
	setTimeout(() => {
		loader.className = loader.className.replace('show', '');
	}, 90000);
};

// Hide loader when fetching finishes
function hideLoader() {
	loader.className = loader.className.replace('show', '');
};

// Function for fetching data from API url:
function fetchData() {
	showLoader(); // invoke loader
	fetch('https://api.magicthegathering.io/v1/cards?random=true&pageSize=100&language=English')
		.then((response) => response.json())
		.then((data) => {
			hideLoader(); // invoke hide loader func
			console.log(data);
			dataArr = data.cards.slice();
			console.log(dataArr); // test
			loadArr = dataArr.slice(0, n);
	
			renderCardList(loadArr);
			btnLoadMore.style.display = 'block'; // show load more button
		});
};
// Function for fetching types for select options
function fetchTypes() {
	fetch('https://api.magicthegathering.io/v1/types')
	.then((response) => response.json())
	.then((data) => {
		console.log(data);
		typesArr = data.types.slice();
		// console.log(typesArr); test

		// create option tags for select tag (by types)
		typesArr.forEach(function(type, i) {
			let option = document.createElement('option');
			option.innerText = type;
			option.setAttribute('value', type.toLowerCase());
			selectTypes.appendChild(option);
		});
	});
};

// Handler function for loading more cards. Initial shown cards are set to 8 
function loadMore() {
	let loadArr = dataArr.slice(8, n + 8);

	renderCardList(loadArr);
	n += 8;
	// console.log(loadArr); test
	if (loadArr.length > 91) {
		btnLoadMore.style.display = 'none';
	} else {
		btnLoadMore.style.display = 'block';
	};
};

// Handler function for handling Routs (callback func. on hashchange and load events)
function handleRoute(e) {
	e.preventDefault();
	let _hash = location.hash;
	// Check: If user is not sign im, than cannot access other pages, and user is redirected on HomePage to sign in
	if (!localStorage.getItem('userName') && _hash != "") {
		location.hash = "";
	};
	// possible Routs options (empty route for HomePage and #cardslist for CardsPage) and non-valid route redirects on empty Route back on HomePage)
	switch (_hash) {
		case '':
			homePage.style.display = 'block';
			cardsPage.style.display = 'none';
			btnToTop.style.display = 'none';
			break;
		case '#cardslist':
			homePage.style.display = 'none';
			cardsPage.style.display = 'block';
			welcomeMsg.innerText = `Hello, ${localStorage.getItem('userName')}`;
			break;
		default:
			location.hash = '';
			break;
	}
	// invoke fetching data on page load and hashchange, only if data array is empty (no data fetched)
	if (dataArr.length === 0) {
		fetchData();
	};
	fetchTypes();
};

// Handler function on Sign in and Form submit (also validation and error message)
function onSignIn(e) {
	e.preventDefault();
	userName = inputField.value;
	if (userName === '' || userName.length < 3 || userName[0] != userName[0].toUpperCase() || !userName.match(/^[a-zA-Z\s]+$/)) {
		small.style.display = 'block';
	} else {
		small.style.display = 'none';
		localStorage.setItem('userName', userName);
		location.hash = '#cardslist';
	};
	inputField.value = '';
};

// Handler function on Sign out and redirecting on HomePage
onSignOut = () => {
	localStorage.removeItem('userName');
	location.hash = '';
};

// Handler function od Search by name, text
function searchNameText(e) {
	cardsList.innerHTML = ''; // clear the container for the new filtered cards
	btnLoadMore.style.display = 'none';
	let keyword = e.target.value;
	let arrByName = dataArr.filter(
		(card) => { 
			return( 
				card.name.toLowerCase().indexOf(keyword.toLowerCase()) > -1 ||
				card.artist.toLowerCase().indexOf(keyword.toLowerCase()) > -1 ||
				card.setName.toLowerCase().indexOf(keyword.toLowerCase()) > -1 
				)
		}	
	);
	renderCardList(arrByName);
	console.log(arrByName);
};

// Handler function for sorting cards by ascending or descending order
function sortAscendDescend(e) {
	cardsList.innerHTML = ''; // clear the container for the new filtered cards
	if (e.target.value == 'ascending') {
		let newArrAscend = dataArr.sort((a, b) => (a.name > b.name ? 1 : -1));
		renderCardList(newArrAscend);
		btnLoadMore.style.display = 'none';
	} else if (e.target.value == 'descending') {
		let newArrDescend = dataArr.sort((a, b) => (a.name < b.name ? 1 : -1));
		renderCardList(newArrDescend);
		btnLoadMore.style.display = 'none';
	};
};

// Handler function for selecting and filtering cards by color
function selectByColor(e) {
	btnLoadMore.style.display = 'none';
	cardsList.innerHTML = ''; // clear the container for the new filtered cards
	let keyColor = e.target.value;
	let arrByColor = dataArr.filter(function(card) {
		if (card.colors) {
			return	card.colors.join(', ').toLowerCase().includes(keyColor.toLowerCase());	
		} 
	});
	renderCardList(arrByColor);
};

// Handler function for selecting cards by types
function selectByTypes(e) {
	btnLoadMore.style.display = 'none';
	cardsList.innerHTML = '';
	let keyType = e.target.value;
	let arrByType = dataArr.filter((card) => card.types.join(', ').toLowerCase().includes(keyType.toLowerCase()));
	
	renderCardList(arrByType);
};

// Handler function for showing and hiding the Top button

function handleScrolling() {
	let scrolled = root.scrollHeight - root.clientHeight;
	if((root.scrollTop / scrolled) > 0.95 ) {
		btnToTop.style.display = 'block';
	} else {
		btnToTop.style.display = 'none';
	};
};

// Handler function for scrolling to the top of the page

function scrollToTop() {
	root.scrollTo({
		top: 0,
		behavior: "smooth"
	});
};

// Event listeners:
form.addEventListener('submit', onSignIn);
btnSignOut.addEventListener('click', onSignOut);
btnLoadMore.addEventListener('click', loadMore);
searchName.addEventListener('keyup', searchNameText);
selectColor.addEventListener('change', selectByColor);
selectTypes.addEventListener('change', selectByTypes);
btnSort.addEventListener('change', sortAscendDescend);
btnToTop.addEventListener('click', scrollToTop);
window.addEventListener('hashchange', handleRoute);
window.addEventListener('load', handleRoute);
document.addEventListener('scroll', handleScrolling);
