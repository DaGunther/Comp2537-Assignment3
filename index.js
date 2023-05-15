const PAGE_SIZE = 10
let currentPage = 1;
let pokemons = []
let filteredPokemons = []

const loadPokemonTypes = async () => {
  const res = await axios.get('https://pokeapi.co/api/v2/type');
  const types = res.data.results;

  types.forEach((type) => {
    $('#filterType').append(`<option value="${type.name}">${type.name}</option>`);
  });
}

const updatePaginationDiv = (currentPage, numPages) => {
    $('#pagination').empty()
  
    let startPage = Math.max(currentPage - 2, 1);
    let endPage = Math.min(startPage + 4, numPages);
    startPage = Math.max(endPage - 4, 1); // recalculate startPage in case endPage is less than 5
    
    if (currentPage > 1) {
      $('#pagination').append(`
      <button class="btn btn-primary page ml-1 numberedButtons" value="${currentPage - 1}">Previous</button>
      `)
    }
  
    for (let i = startPage; i <= endPage; i++) {
      $('#pagination').append(`
      <button class="btn btn-primary page ml-1 numberedButtons" ${i === currentPage ? 'disabled' : ''} value="${i}">${i}</button>
      `)
    }
  
    if (currentPage < numPages) {
      $('#pagination').append(`
      <button class="btn btn-primary page ml-1 numberedButtons" value="${currentPage + 1}">Next</button>
      `)
    }
  }
  

  const paginate = (currentPage, PAGE_SIZE, pokemons) => {
    const selectedPokemons = pokemons.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  
    $('#pokeCards').empty()
    selectedPokemons.forEach((pokemon) => {
      $('#pokeCards').append(`
        <div class="pokeCard card" pokeName=${pokemon.name}   >
          <h3>${pokemon.name.toUpperCase()}</h3> 
          <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}"/>
          <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#pokeModal">
            More
          </button>
        </div>  
      `)
    })
    // Update the count of displayed pokemons
  updatePokemonCount(pokemons.length, selectedPokemons.length);
}
  

const filterByType = (type) => {
    currentPage = 1; // reset currentPage when changing filter
  
    if (type !== 'all') {
      filteredPokemons = pokemons.filter(pokemon => pokemon.types.some(t => t.type.name === type));
    } else {
      filteredPokemons = pokemons;
    }
  
    paginate(currentPage, PAGE_SIZE, filteredPokemons);
    const numPages = Math.ceil(filteredPokemons.length / PAGE_SIZE);
    updatePaginationDiv(currentPage, numPages);
  
    // Update the total count of pokemons
    updatePokemonCount(pokemons.length, filteredPokemons.length);
  }

  const updatePokemonCount = (totalPokemons, displayedPokemons) => {
    $('#pokemonCount').html(`Displaying ${displayedPokemons} out of ${totalPokemons}`);
  }

const setup = async () => {
  // test out poke api using axios here


  $('#pokeCards').empty()
  $('#pokeCards').empty()
  let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
  const pokemonPromises = response.data.results.map(pokemon => axios.get(pokemon.url));
  const pokemonResponses = await Promise.all(pokemonPromises);
  pokemons = pokemonResponses.map(res => res.data);
  filteredPokemons = pokemons;

  paginate(currentPage, PAGE_SIZE, filteredPokemons);
  const numPages = Math.ceil(filteredPokemons.length / PAGE_SIZE);
  updatePaginationDiv(currentPage, numPages);



  // pop up modal when clicking on a pokemon card
  // add event listener to each pokemon card
  $('body').on('click', '.pokeCard', async function (e) {
    const pokemonName = $(this).attr('pokeName')
    // console.log("pokemonName: ", pokemonName);
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
    // console.log("res.data: ", res.data);
    const types = res.data.types.map((type) => type.type.name)
    // console.log("types: ", types);
    $('.modal-body').html(`
        <div style="width:200px">
        <img src="${res.data.sprites.other['official-artwork'].front_default}" alt="${res.data.name}"/>
        <div>
        <h3>Abilities</h3>
        <ul>
        ${res.data.abilities.map((ability) => `<li>${ability.ability.name}</li>`).join('')}
        </ul>
        </div>

        <div>
        <h3>Stats</h3>
        <ul>
        ${res.data.stats.map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
        </ul>

        </div>

        </div>
          <h3>Types</h3>
          <ul>
          ${types.map((type) => `<li>${type}</li>`).join('')}
          </ul>
      
        `)
    $('.modal-title').html(`
        <h2>${res.data.name.toUpperCase()}</h2>
        <h5>${res.data.id}</h5>
        `)
  })

  loadPokemonTypes();

  // add event listener to pagination buttons
  $('body').on('click', ".numberedButtons", async function (e) {
    currentPage = Number(e.target.value);
    paginate(currentPage, PAGE_SIZE, filteredPokemons);

    //update pagination buttons
    const numPages = Math.ceil(filteredPokemons.length / PAGE_SIZE);
  updatePaginationDiv(currentPage, numPages);
  })
  
  $('#filterType').on('change', function() {
    const type = $(this).val();
    filterByType(type);
  });

}

$(document).ready(setup)