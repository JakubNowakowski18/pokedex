// Pobranie elementów HTML
const container = document.querySelector('#whole__container');
const buttonActive = document.querySelector('.btn__load');
const buttonRegular = document.querySelector('.btn__regular');
const btn = document.querySelector('.btn'); // Przycisk load more
const emptySearch = document.querySelector('.whole__empty-search');
const search = document.querySelector('.whole__search-item'); // Wyszukiwarka
const pokemonContent = [];

// Po załadowaniu DOMu łączę się z API za pomocą funkcji getApi i wyświetlam content za pomocą funkcji getPokemon
document.addEventListener("DOMContentLoaded", async () => {
    let pokemons = await getApi(`https://pokeapi.co/api/v2/pokemon?limit=20&offset=0`);
    
    for (let pokemon of pokemons.results) {
        const pokemonData = await getApi(pokemon.url);
        await getPokemon(pokemonData);
        pokemonContent.push(pokemonData);
    }

// Add Event listener to button - render more 20 pokemons
// Zmienne/Ustawienia potrzebne przed kliknięciem buttona
    
    let offset = 0;
    
    buttonActive.style.display = 'none';
    
    // Funkcja odpowiadająca za czynności wykonywane po kliknięciu buttona "Load more"
    const activeBtnLoadMore = async () => {
        offset += 20;
        pokemons = await getApi(`https://pokeapi.co/api/v2/pokemon?limit=20&offset=${offset}`);
        btn.classList.add('btn_load');
        buttonActive.style.display = 'block';
        buttonRegular.style.display = 'none';
        btn.disabled = true;
        
        for (let pokemon of pokemons.results) {
            let pokemonData = await getApi(pokemon.url);
            pokemonContent.push(pokemonData)
        }
        if (pokemonContent.length === 20) {
            for (const x of pokemonContent) {
                await getPokemon(x);
                btn.classList.remove('btn_load');
            }
        }
        // Czynności po załadowaniu pokemonów
        btn.disabled = false;
        buttonRegular.style.display = 'block';
        buttonActive.style.display = 'none';
        
        
        // Ponowne wywołanie eventów przypisanych do poniższych elementów za pomocą kliknięcia przycisku "Load more"
        search.dispatchEvent(new Event("input"));
        if (activeType) {
            btnSearch.dispatchEvent(new Event("click")); // Dodane z zadania 4
        }
        
        let lastPokemonLoaded = container.lastChild;
        if (lastPokemonLoaded) {
            lastPokemonLoaded.scrollIntoView();
        }
    }
    
    btn.addEventListener('click', activeBtnLoadMore);
});

// Funkcja załadowania pokemonów do contentu
const getPokemon = (pokemonData) => {
    
    const pokemonWindow = document.createElement('div');
    pokemonWindow.className = 'pokemonWindow';
    
    const pokemonBox = document.createElement('div');
    pokemonBox.className = 'pokemon';
    
    const pokemonDescription = document.createElement('div');
    pokemonDescription.className = 'pokemonDescription';
    
    const pokemonImg = document.createElement('img');
    pokemonImg.src = pokemonData.sprites.front_default;
    pokemonImg.alt = pokemonData.name;
    
    
    const pokemonName = document.createElement('p');
    pokemonName.innerText = pokemonData.name;
    
    const pokemonType = document.createElement('p');
    pokemonType.className = 'type';
    
    for (let types of pokemonData.types) {
        
        let typeElement = document.createElement('p');
        let type = types.type.name;
        
        let text = type.charAt(0).toUpperCase() + type.slice(1);
        typeElement.innerText = text;
        typeElement.className = type;
        
        pokemonType.appendChild(typeElement);
    }
    
    pokemonBox.appendChild(pokemonImg);
    
    pokemonDescription.appendChild(pokemonName);
    pokemonDescription.appendChild(pokemonType);
    
    pokemonWindow.appendChild(pokemonBox);
    pokemonWindow.appendChild(pokemonDescription);
    container.appendChild(pokemonWindow);
}

// Ogólna funkcja do pobierania Api ze strony
const getApi = async (url) => {
    const adres = await fetch(url);
    return await adres.json();
}


// Wyszukiwarka tekstowa
let inputValue;
search.addEventListener('input', event => {
    inputValue = event.target.value;
    // Modyfikacja związana z zadaniem 4 (zastąpienie wcześniejszej funkcji funkcją searchPokemon();
    searchPokemon();
});


// Zadanie 4
// Api do typów : https://pokeapi.co/api/v2/type

//Zmienne z odwołaniem do elementów DOM
const searchIcon = document.querySelector('.whole__search-list'); // Przycisk listy typów pokemonów w wyszukiwarce
const btnSearch = document.querySelector('.btnSearch');
const btnRemove = document.querySelector('.btnRemove');
const typeSearcher = document.querySelector('.typeSearcher');
const typeSearcherItem = document.querySelector('.typeSearcherItem');

// Niezbędne zmienne globalne
// Utworzenie zmiennej globalnej i przypisanie do niej niektórych elementów z różnych funkcji, pozwala korzystać z elementów funkcji lokalnej na szczeblu globalnym
let typesArray = [];
let activeType;
let apiTypes;

// Funkcja, która pozwala na pokazanie/ukrycie listy typów
const showHide = () => {
    if (typeSearcher.style.visibility === 'visible') {
        typeSearcher.style.visibility = 'hidden';
    } else {
        typeSearcher.style.visibility = 'visible';
    }
}

//Funkcja pozyskania elementów z API typów
const getApiType = async () => {
    const api = 'https://pokeapi.co/api/v2/type';
    let apiWithType = await getApi(api);
    apiTypes = apiWithType.results;
}


// Funkcja, która odpowiada za tworzenie inputów nadając im odpowiednie nazwy - typów pokemonów
const createTypeBox = async () => {
    await getApiType();
    
    apiTypes.forEach((type) => {
        //Utworzenie inputów dla typów pokemonów
        let inputOfType = document.createElement('input');
        
        inputOfType.type = 'radio';
        inputOfType.id = type.name;
        inputOfType.name = 'pokemon';
        typeSearcherItem.appendChild(inputOfType);
        typesArray.push(type.name)
        
        //Utworzenie labeli dla typów pokemonów
        let labelOfType = document.createElement('label');
        labelOfType.htmlFor = type.name;
        labelOfType.innerText = type.name.charAt(0).toUpperCase() + type.name.slice(1);
        labelOfType.classList.add(type.name + 1, 'labels');
        
        typeSearcherItem.appendChild(labelOfType);
        inputOfType.addEventListener('click', () => {
            activeType = inputOfType.id;
        })
    });
}

//Funkcja łącząca wyszukiwanie po tekście w wyszukiwarce oraz po typie Pokemonów (jest to ogólna funkcja obsługująca wyszukiwarkę).

const searchPokemon = () => {
    let renderPokemon;
    //Uwzględnienie activeType czyli wybranego typu pokemonów
    if (activeType && inputValue) {
        // some() - fajna funkcja musze zapisać i poczytać ( w filter() działa jak foreach i przejezdza po tabeli szukajac wartości)
        renderPokemon = pokemonContent.filter(pokemon => pokemon.name.toLowerCase().includes(inputValue) && pokemon.types.some((types) => types.type.name === activeType));
    } else if (activeType === true && inputValue === false) {
        renderPokemon = pokemonContent.filter(pokemon => pokemon.types.some((types) => types.type.name === activeType));
    } else if (activeType === false && inputValue === true) {
        renderPokemon = pokemonContent.filter(pokemon => pokemon.name.toLowerCase().includes(inputValue));
    } else if (activeType) {
        renderPokemon = pokemonContent.filter(pokemon => pokemon.types.some((types) => types.type.name === activeType));
    } else if (inputValue) {
        renderPokemon = pokemonContent.filter(pokemon => pokemon.name.toLowerCase().includes(inputValue));
    } else {
        renderPokemon = pokemonContent;
    }
    
    container.innerHTML = '';
    renderPokemon.forEach(pokemon => {
        getPokemon(pokemon);
    })
    if (container.innerHTML === '') {
        container.classList.add('pox');
        emptySearch.style.display = 'flex';
    } else {
        container.classList.remove('pox');
        emptySearch.style.display = 'none';
    }
}

// Funkcja, która ma za zadanie dodać typy pokemonów do listy wyszukiwania.
const addTypesToList = () => {
    if (typesArray.length === 0) {
        createTypeBox();
    }
}

btnRemove.addEventListener('click', () => {
    activeType = '';
    searchPokemon();
})

//Wywołanie funkcji na zdarzeniach DOM
searchIcon.addEventListener('click', addTypesToList);
btnSearch.addEventListener('click', searchPokemon);
searchIcon.addEventListener('click', getApiType);
searchIcon.addEventListener('click', showHide);


