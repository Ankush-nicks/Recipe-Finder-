let s_input = document.getElementById("search_input");
let btn = document.getElementById("search_button");

document.querySelectorAll(".button-div .c-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    s_input.value = this.textContent;
    s_input.focus();
    // Trigger search
    document.getElementById("search_button").click();
  });
});

function to_card(myobject) {
  let results = document.getElementById("results");

  let card = document.createElement("div");
  card.classList.add("card");

  card.addEventListener("click", async function () {
    const detailUrl = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${myobject.id}`;
    try {
      const res = await fetch(detailUrl);
      const data = await res.json();
      const meal = data.meals[0];
      show_full_details(meal);
    } catch (err) {
      console.error("Error fetching full details:", err);
    }
  });

  let img = document.createElement("img");
  img.src = myobject.src;
  card.appendChild(img);

  let h3 = document.createElement("h3");
  h3.textContent = myobject.name;
  h3.style.marginTop = '20px'
  card.appendChild(h3);

  let buttons = document.createElement("div");

  let btn1 = document.createElement("button");
  btn1.textContent = myobject.area;
  btn1.classList.add("c-btn");
  btn1.style.color = "rgb(255, 111, 0)";
  buttons.appendChild(btn1);

  let btn2 = document.createElement("button");
  btn2.textContent = myobject.category;
  btn2.classList.add("c-btn");
  btn2.style.backgroundColor = "rgb(164, 177, 250)";
  btn2.style.color = "rgb(43, 57, 137)";
  buttons.appendChild(btn2);

  card.appendChild(buttons);

  let p = document.createElement("p");
  p.textContent = myobject.instruction;
  card.appendChild(p);

  let link = document.createElement("a");
  link.href = myobject.source || "#";
  link.textContent = "Click for Full Recipe";
  link.target = "_blank";
  link.style.color = "rgb(255, 111, 0)";
  card.appendChild(link);

  results.appendChild(card);
}


document.getElementById("back_button").addEventListener("click", function () {
  document.getElementById("details_section").style.display = "none";
  document.getElementById("results").style.display = "flex";
  document.getElementById("bottom-section").style.display = "block";
});



btn.addEventListener("click", async function () {
  let results = document.getElementById('results');
  let value = s_input.value.trim();
  let search_text = document.createElement('h1');
  search_text.textContent = `Search Results for "${value}"`;
  results.appendChild(search_text);
  if (!value) return;

  const loader = document.getElementById("loading");
  results.innerHTML = "";
  loader.style.display = "block";

  const searchByName = `https://www.themealdb.com/api/json/v1/1/search.php?s=${value}`;
  const searchByIngredient = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${value}`;

  try {
    // Try searching by name
    const nameRes = await fetch(searchByName);
    const nameData = await nameRes.json();

    if (nameData.meals) {
      for (let i = 0; i < Math.min(nameData.meals.length, 8); i++) {
        const meal = nameData.meals[i];
        const formattedMeal = {
          id: meal.idMeal,
          src: meal.strMealThumb,
          name: meal.strMeal,
          area: meal.strArea,
          category: meal.strCategory,
          instruction: meal.strInstructions,
          source: meal.strSource,
        };
        to_card(formattedMeal);
      }
    } else {
      // Fallback to search by ingredient
      const ingRes = await fetch(searchByIngredient);
      const ingData = await ingRes.json();

      if (!ingData.meals || ingData.meals.length === 0) {
        results.innerHTML = "<p>No recipes found.</p>";
        loader.style.display = "none";
        return;
      }

      for (let i = 0; i < Math.min(ingData.meals.length, 10); i++) {
        const mealId = ingData.meals[i].idMeal;
        const detailUrl = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`;

        try {
          const detailRes = await fetch(detailUrl);
          const detailData = await detailRes.json();
          const meal = detailData.meals[0];

          const formattedMeal = {
            id: meal.idMeal,
            src: meal.strMealThumb,
            name: meal.strMeal,
            area: meal.strArea,
            category: meal.strCategory,
            instruction: meal.strInstructions,
            source: meal.strSource,
          };

          to_card(formattedMeal);
        } catch (err) {
          console.error("Error fetching meal details:", err);
        }
      }
    }
  } catch (err) {
    results.innerHTML = "<p>Error fetching recipes. Please try again.</p>";
    console.error("Fetch error:", err);
  } finally {
    document.getElementById("bottom-section").style.display = "none";
    loader.style.display = "none";
  }
});

function show_full_details(meal) {
  const detailsSection = document.getElementById("details_section");
  const fullRecipe = document.getElementById("full_recipe");
  const results = document.getElementById("results");
  const bottomSection = document.getElementById("bottom-section");

  results.style.display = "none";
  bottomSection.style.display = "none";
  detailsSection.style.display = "block";
  fullRecipe.innerHTML = "";

  const title = document.createElement("h1");
  title.textContent = meal.strMeal;

  const img = document.createElement("img");
  img.src = meal.strMealThumb;
  img.style.width = "100%";
  img.style.maxWidth = "500px";
  img.style.borderRadius = "10px";

  const info = document.createElement("p");
  info.innerHTML = `
    <strong>Category:</strong> ${meal.strCategory}<br>
    <strong>Area:</strong> ${meal.strArea}<br>
    <strong>Tags:</strong> ${meal.strTags || "N/A"}<br>
    <strong>Youtube:</strong> <a href="${meal.strYoutube}" target="_blank">${meal.strYoutube}</a><br>
  `;

  const ingredients = document.createElement("ul");
  ingredients.innerHTML = "<strong>Ingredients:</strong><br>";
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ing && ing.trim() !== "") {
      const li = document.createElement("li");
      li.textContent = `${measure} ${ing}`;
      ingredients.appendChild(li);
    }
  }

  const instructions = document.createElement("p");
  instructions.innerHTML = `<strong>Instructions:</strong><br>${meal.strInstructions}`;

  const sourceLink = document.createElement("a");
  sourceLink.href = meal.strSource || "#";
  sourceLink.textContent = "View Full Source";
  sourceLink.target = "_blank";
  sourceLink.style.color = "rgb(255, 111, 0)";

  fullRecipe.appendChild(title);
  fullRecipe.appendChild(img);
  fullRecipe.appendChild(info);
  fullRecipe.appendChild(ingredients);
  fullRecipe.appendChild(instructions);
  fullRecipe.appendChild(sourceLink);
}


