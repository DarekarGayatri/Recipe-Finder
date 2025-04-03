const apiKey = "ed835382319d45faad9df2469c4bea13";
const searchBtn = document.getElementById("search-btn");
const ingredientsInput = document.getElementById("ingredients");
const recipeResults = document.getElementById("recipe-results");
const container = document.querySelector(".container");

// Fetch recipes based on ingredients
async function fetchRecipes(ingredients) {
  try {
    // Sanitize ingredients by encoding URI components
    const sanitizedIngredients = encodeURIComponent(ingredients);
    const response = await fetch(
      `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${sanitizedIngredients}&number=51&apiKey=${apiKey}`
    );
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const recipes = await response.json();
    displayRecipes(recipes);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    recipeResults.innerHTML = `<p class="error">Failed to fetch recipes. Try again later.</p>`;
  }
}

// Search button click event
searchBtn.addEventListener("click", () => {
  const ingredients = ingredientsInput.value.trim();
  if (ingredients && ingredients.length > 0) {
    fetchRecipes(ingredients);
  } else {
    alert("Please enter ingredients.");
  }
});

// Display recipes in the UI
// Add this function to fetch recipe details
async function fetchRecipeDetails(id) {
  try {
    const response = await fetch(
      `https://api.spoonacular.com/recipes/${id}/information?apiKey=${apiKey}`
    );
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching recipe details:", error);
    return null;
  }
}

// Update the displayRecipes function
function displayRecipes(recipes) {
  recipeResults.innerHTML = "";
  if (recipes.length === 0) {
    recipeResults.innerHTML = `<p class="not-found">No recipes found. Try different ingredients.</p>`;
    return;
  }

  recipes.forEach(async (recipe) => {
    const recipeDetails = await fetchRecipeDetails(recipe.id);
    const recipeCard = document.createElement("div");
    recipeCard.classList.add("recipe-card");
    recipeCard.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.title}" />
      <div class="details">
        <h3>${recipe.title}</h3>
        <div class="ingredients">
          <h4>Ingredients:</h4>
          <ul>
            ${recipeDetails?.extendedIngredients?.map(ing => 
              `<li>${ing.original}</li>`
            ).join('') || 'Ingredients not available'}
          </ul>
        </div>
        <div class="instructions">
          <h4>Instructions:</h4>
          <ol>
            ${recipeDetails?.analyzedInstructions[0]?.steps?.map(step => 
              `<li>${step.step}</li>`
            ).join('') || 'Instructions not available'}
          </ol>
        </div>
        <p>Used Ingredients: ${recipe.usedIngredientCount}</p>
        <p>Missed Ingredients: ${recipe.missedIngredientCount}</p>
      </div>
      <button onclick="saveToFavorites('${recipe.title}')">Save to Favorites</button>
    `;
    recipeResults.appendChild(recipeCard);
  });
}

// Add these constants at the top with other constants
const favoritesBtn = document.createElement("button");
favoritesBtn.innerHTML = '<i class="fa-solid fa-heart" style="color: white;"></i>';
favoritesBtn.classList.add("favorites-btn");
container.appendChild(favoritesBtn);

const favoritesSection = document.createElement("div");
favoritesSection.classList.add("favorites-section");
favoritesSection.style.display = "none";
container.appendChild(favoritesSection);

// Add this new function to display favorites
function displayFavorites() {
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  favoritesSection.innerHTML = `
    <h2>My Favorite Recipes</h2>
    ${favorites.length === 0 
      ? '<p>No favorite recipes yet</p>' 
      : `<ul>${favorites.map(title => `
          <li>
            <span class="recipe-title" onclick="showRecipeDetails('${title}')">${title}</span>
            <button onclick="removeFromFavorites('${title}')">Remove</button>
          </li>`).join('')}
        </ul>`
    }
    <button class="close-favorites">Close</button>
  `;
  favoritesSection.style.display = "block";
  recipeResults.style.display = "none";
}

// Add this new function to show recipe details
async function showRecipeDetails(title) {
  try {
    const response = await fetch(
      `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(title)}&apiKey=${apiKey}&number=1`
    );
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const recipeId = data.results[0].id;
      const recipeDetails = await fetchRecipeDetails(recipeId);
      displayRecipes([recipeDetails]);
      favoritesSection.style.display = "none";
      recipeResults.style.display = "grid";
    }
  } catch (error) {
    console.error("Error fetching recipe details:", error);
  }
}

// Add this function to remove favorites
function removeFromFavorites(title) {
  let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  favorites = favorites.filter(fav => fav !== title);
  localStorage.setItem('favorites', JSON.stringify(favorites));
  displayFavorites();
}

// Add these event listeners after your existing code
favoritesBtn.addEventListener("click", displayFavorites);

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("close-favorites")) {
    favoritesSection.style.display = "none";
    recipeResults.style.display = "grid";
  }
});

// Add this function to handle favorites
function saveToFavorites(title) {
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  if (!favorites.includes(title)) {
    favorites.push(title);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    alert(`${title} added to favorites!`);
  } else {
    alert('This recipe is already in your favorites!');
  }
}