#!/bin/bash
set -euo pipefail # Exit on error, undefined variable, or pipe failure

# --- Configuration ---
DEFAULT_PROJECT_NAME="shop-erp-system"

# --- Helper Functions ---
prompt_for_project_name() {
  read -r -p "Enter project name (default: $DEFAULT_PROJECT_NAME): " PROJECT_NAME
  PROJECT_NAME="${PROJECT_NAME:-$DEFAULT_PROJECT_NAME}" # Use default if empty
}

check_command_exists() {
  command -v "$1" >/dev/null 2>&1 || {
    echo >&2 "Error: Command '$1' not found. Please install it and try again."
    echo >&2 "On EndeavourOS, you might need: sudo pacman -S nodejs npm"
    exit 1
  }
}

create_dir_if_not_exists() {
  local dir_path="$1"
  if [ ! -d "$dir_path" ]; then
    echo "Creating directory: $dir_path"
    mkdir -p "$dir_path"
  else
    echo "Directory already exists: $dir_path (Skipping)"
  fi
}

create_file_if_not_exists() {
  local file_path="$1"
  local content="${2:-// Placeholder for $(basename "$file_path")}" # Default content
  if [ ! -f "$file_path" ]; then
    echo "Creating file: $file_path"
    echo -e "$content" > "$file_path"
  else
    echo "File already exists: $file_path (Skipping)"
  fi
}

# --- Main Script ---
echo "Vue.js Shop ERP System Setup Script"
echo "------------------------------------"

# 0. Check prerequisites
check_command_exists "node"
check_command_exists "npm"

# 1. Get Project Name
prompt_for_project_name

if [ -d "$PROJECT_NAME" ]; then
  echo "Warning: Project directory '$PROJECT_NAME' already exists."
  read -r -p "Do you want to proceed and potentially add files/initialize Vue in it? (y/N): " CONFIRM_PROCEED
  if [[ "$CONFIRM_PROCEED" != "y" && "$CONFIRM_PROCEED" != "Y" ]]; then
    echo "Exiting."
    exit 0
  fi
else
  echo "Creating project directory: $PROJECT_NAME"
  mkdir "$PROJECT_NAME"
fi

cd "$PROJECT_NAME"
PROJECT_ROOT_DIR=$(pwd)
echo "Working in: $PROJECT_ROOT_DIR"

# 2. Create Vue Project using Vite
if [ ! -f "package.json" ]; then
  echo "Initializing Vue 3 project with Vite in the current directory ('.')..."
  echo ">>> IMPORTANT: When prompted by 'create-vue':"
  echo ">>>   - Select YES for 'Add Vue Router for Single Page Application development?'"
  echo ">>>   - Select YES for 'Add Pinia for state management?'"
  echo ">>>   - You can choose other options (TypeScript, JSX, Vitest, etc.) as per your preference."
  npm create vue@latest . # The '.' means create in the current directory.
  # create-vue will guide through options.

  echo "Vue project scaffolding complete. Installing dependencies..."
  npm install
else
  echo "'package.json' found. Assuming Vue project is already initialized or partially set up."
  echo "If dependencies are missing or outdated, you might need to run 'npm install' or 'npm update'."
fi

# 3. Create detailed src structure
echo -e "\n--- Ensuring Detailed Src Structure ---"
SRC_DIR="src"

# Vite typically creates src, assets, components, router, stores (if selected), views (renamed to pages later)
create_dir_if_not_exists "$SRC_DIR/assets"
create_dir_if_not_exists "$SRC_DIR/components/common"
create_dir_if_not_exists "$SRC_DIR/components/products"
create_dir_if_not_exists "$SRC_DIR/components/pos"
create_dir_if_not_exists "$SRC_DIR/components/dashboard"
create_dir_if_not_exists "$SRC_DIR/layouts"
create_dir_if_not_exists "$SRC_DIR/pages" # We'll use 'pages'
create_dir_if_not_exists "$SRC_DIR/pages/products"
create_dir_if_not_exists "$SRC_DIR/pages/auth"
# router and stores directories are usually created by `npm create vue@latest` if selected.
create_dir_if_not_exists "$SRC_DIR/router"
create_dir_if_not_exists "$SRC_DIR/stores"


# Check if Vite created 'src/views' and rename it to 'src/pages' if 'pages' doesn't exist
if [ -d "$SRC_DIR/views" ] && [ ! -d "$SRC_DIR/pages" ]; then
  echo "Found 'src/views' (created by Vite), renaming to 'src/pages' for consistency."
  mv "$SRC_DIR/views" "$SRC_DIR/pages"
  echo "NOTE: You may need to manually update import paths in '$SRC_DIR/router/index.js'"
  echo "      if they refer to '@views/' to now use '@pages/' (e.g., change import('@/views/HomeView.vue') to import('@/pages/HomePage.vue') )."
  echo "      The LLM will provide router code assuming '@pages/'."
elif [ -d "$SRC_DIR/views" ] && [ -d "$SRC_DIR/pages" ]; then
   echo "Warning: Both '$SRC_DIR/views' and '$SRC_DIR/pages' exist. Using '$SRC_DIR/pages'."
   echo "You might want to consolidate or remove '$SRC_DIR/views'."
fi


# Create placeholder files (content will be provided later by the LLM)
echo -e "\n--- Creating Placeholder Files (if they don't exist) ---"

# Assets
create_file_if_not_exists "$SRC_DIR/assets/main.css" "/* Global styles, CSS variables, theme styles */\n\n:root {\n  --primary-color: #007bff;\n}\n\nbody {\n  font-family: sans-serif;\n  margin: 0;\n}"

# Components - Common
create_file_if_not_exists "$SRC_DIR/components/common/AppHeader.vue" "<template>\n  <header class=\"app-header\">\n    \n  </header>\n</template>\n\n<script setup>\n// Logic for AppHeader\n</script>\n\n<style scoped>\n.app-header {\n  padding: 1rem;\n  background-color: #f0f0f0;\n}\n</style>"
create_file_if_not_exists "$SRC_DIR/components/common/AppSidebar.vue" "<template>\n  <aside class=\"app-sidebar\">\n    \n  </aside>\n</template>\n\n<script setup>\n// Logic for AppSidebar\n</script>\n\n<style scoped>\n.app-sidebar {\n  padding: 1rem;\n  background-color: #e9e9e9;\n}\n</style>"
create_file_if_not_exists "$SRC_DIR/components/common/ThemeSwitcher.vue" "<template>\n  <button @click=\"toggleTheme\">\n    Switch Theme\n  </button>\n</template>\n\n<script setup>\n// Logic for ThemeSwitcher\nconst toggleTheme = () => {\n  console.log('Theme switched');\n};\n</script>"

# Components - Products
create_file_if_not_exists "$SRC_DIR/components/products/ProductForm.vue" "<template>\n  <form class=\"product-form\">\n    \n  </form>\n</template>\n\n<script setup>\n// Logic for ProductForm\n</script>"
create_file_if_not_exists "$SRC_DIR/components/products/ProductCard.vue" "<template>\n  <div class=\"product-card\">\n    \n  </div>\n</template>\n\n<script setup>\n// Logic for ProductCard\n</script>"
create_file_if_not_exists "$SRC_DIR/components/products/ProductList.vue" "<template>\n  <div class=\"product-list\">\n    \n  </div>\n</template>\n\n<script setup>\n// Logic for ProductList\n</script>"

# Components - POS
create_file_if_not_exists "$SRC_DIR/components/pos/POSItemSelector.vue" "<template>\n  <div class=\"pos-item-selector\">\n    \n  </div>\n</template>\n\n<script setup>\n// Logic for POSItemSelector\n</script>"
create_file_if_not_exists "$SRC_DIR/components/pos/POSCart.vue" "<template>\n  <div class=\"pos-cart\">\n    \n  </div>\n</template>\n\n<script setup>\n// Logic for POSCart\n</script>"

# Components - Dashboard
create_file_if_not_exists "$SRC_DIR/components/dashboard/StatCard.vue" "<template>\n  <div class=\"stat-card\">\n    \n  </div>\n</template>\n\n<script setup>\n// Logic for StatCard\n</script>"

# Layouts
create_file_if_not_exists "$SRC_DIR/layouts/DefaultLayout.vue" "<template>\n  <div class=\"default-layout\">\n    \n    <div class=\"main-container\">\n      \n      <main>\n        <router-view />\n      </main>\n    </div>\n  </div>\n</template>\n\n<script setup>\n// import AppHeader from '@/components/common/AppHeader.vue';\n// import AppSidebar from '@/components/common/AppSidebar.vue';\n</script>\n\n<style scoped>\n.main-container {\n  display: flex;\n}\nmain {\n  flex-grow: 1;\n  padding: 1rem;\n}\n</style>"

# Pages (Vite might create some of these in src/views, which we handle above)
create_file_if_not_exists "$SRC_DIR/pages/DashboardPage.vue" "<template>\n  <div class=\"dashboard-page\">\n    <h1>Dashboard</h1>\n  </div>\n</template>\n<script setup></script>"
create_file_if_not_exists "$SRC_DIR/pages/products/AddProductPage.vue" "<template>\n  <div class=\"add-product-page\">\n    <h1>Add New Product</h1>\n  </div>\n</template>\n<script setup></script>"
create_file_if_not_exists "$SRC_DIR/pages/products/ProductsListPage.vue" "<template>\n  <div class=\"products-list-page\">\n    <h1>Products</h1>\n  </div>\n</template>\n<script setup></script>"
create_file_if_not_exists "$SRC_DIR/pages/CustomersPage.vue" "<template>\n  <div class=\"customers-page\">\n    <h1>Customers</h1>\n  </div>\n</template>\n<script setup></script>"
create_file_if_not_exists "$SRC_DIR/pages/POSPage.vue" "<template>\n  <div class=\"pos-page\">\n    <h1>Point of Sale</h1>\n  </div>\n</template>\n<script setup></script>"
create_file_if_not_exists "$SRC_DIR/pages/SettingsPage.vue" "<template>\n  <div class=\"settings-page\">\n    <h1>Settings</h1>\n  </div>\n</template>\n<script setup></script>"
create_file_if_not_exists "$SRC_DIR/pages/auth/LoginPage.vue" "<template>\n  <div class=\"login-page\">\n    <h1>Login</h1>\n  </div>\n</template>\n<script setup></script>"

# Router (index.js is usually created by Vue CLI/Vite if router is selected)
create_file_if_not_exists "$SRC_DIR/router/index.js" "// Vue Router configuration will be provided here."

# Stores (Pinia stores)
create_file_if_not_exists "$SRC_DIR/stores/themeStore.js" "// Pinia store for theme management."
create_file_if_not_exists "$SRC_DIR/stores/productStore.js" "// Pinia store for products."
create_file_if_not_exists "$SRC_DIR/stores/customerStore.js" "// Pinia store for customers (Stub)."
create_file_if_not_exists "$SRC_DIR/stores/cartStore.js" "// Pinia store for POS cart."
create_file_if_not_exists "$SRC_DIR/stores/userStore.js" "// Pinia store for user authentication (Stub)."

# Main files (App.vue and main.js are created by Vue CLI/Vite)
# Add a simple default if they somehow weren't created.
create_file_if_not_exists "$SRC_DIR/App.vue" "<template>\n  <router-view />\n</template>\n<script setup>\n</script>"
create_file_if_not_exists "$SRC_DIR/main.js" "// Vue app entry point. Configuration will be provided here."


echo -e "\n--- Project Setup and Structure Generation Complete ---"
echo "Project '$PROJECT_NAME' is ready in: $PROJECT_ROOT_DIR"
echo -e "\nNext steps:"
echo "1. Open the project folder '$PROJECT_NAME' in IntelliJ IDEA."
echo "2. IntelliJ IDEA should automatically recognize it as a Node.js/Vue project."
echo "   If not, you might need to configure the Node.js interpreter (File > Settings > Languages & Frameworks > Node.js)."
echo "3. Install the Vue.js plugin in IntelliJ IDEA if you haven't already (File > Settings > Plugins)."
echo "4. I will now provide the code to populate these files."
echo "5. After populating the files, run 'npm run dev' from the terminal within '$PROJECT_NAME' to start the development server."


