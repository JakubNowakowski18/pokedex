// Pobranie elementów HTML
const container = document.querySelector('#whole__container');
const buttonActive = document.querySelector('.btn__load');
const buttonRegular = document.querySelector('.btn__regular');
const btn = document.querySelector('.btn');
const search = document.querySelector('.whole__search-item');
const emptySearch = document.querySelector('.whole__empty-search');
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

// Aktywacja buttona
    
    btn.addEventListener('click', async () => {
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
        
        // Dodanie sprawdzenia, czy istnieje jakaś wartość w wyszukiwarce, jeśli tak to wykonaj funkcję wyszukania
        search.dispatchEvent(new Event("input"));
        
        let lastPokemonLoaded = container.lastChild;
        if (lastPokemonLoaded) {
            lastPokemonLoaded.scrollIntoView();
        }
    })
});

// Funkcja załadowania pokemonów do contentu
const getPokemon = (pokemonData) => {
    
    const pokemonBox = document.createElement('div');
    pokemonBox.className = 'pokemon';
    
    const pokemonImg = document.createElement('img');
    pokemonImg.src = pokemonData.sprites.front_default;
    pokemonImg.alt = pokemonData.name;
    
    
    const pokemonName = document.createElement('p');
    pokemonName.innerText = pokemonData.name;
    
    pokemonBox.appendChild(pokemonImg);
    pokemonBox.appendChild(pokemonName);
    container.appendChild(pokemonBox);
}

// Pobranie Api ze strony
const getApi = async (url) => {
    const adres = await fetch(url);
    return await adres.json();
}

// Wyszukiwarka

search.addEventListener('input', event => {
    const inputValue = event.target.value;
    
    const renderSearchPokemon = pokemonContent.filter(pokemon => pokemon.name.toLowerCase().includes(inputValue));
    container.innerHTML = '';
    renderSearchPokemon.forEach(pokemon => {
        getPokemon(pokemon);
    })
    if (renderSearchPokemon.length === 0) {
        container.classList.add('pox');
        emptySearch.style.display = 'flex';
    } else {
        container.classList.remove('pox');
        emptySearch.style.display = 'none';
    }
});

