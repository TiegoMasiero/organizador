// Dados iniciais dos usuários e tarefas
let users = JSON.parse(localStorage.getItem("users")) || [
  { id: "u1", username: "admin", password: "admin123", role: "admin" },
  { id: "u2", username: "membro", password: "membro123", role: "member" }
];

let tasks = JSON.parse(localStorage.getItem("tasks")) || [
  {
    id: "001",
    title: "Identidade visual",
    client: "Cliente A",
    desc: "Criar logotipo e paleta de cores",
    column: "briefing",
    urgent: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "002",
    title: "Planejamento de campanha",
    client: "Cliente B",
    desc: "Redigir cronograma para redes sociais",
    column: "andamento",
    urgent: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "003",
    title: "Aprovação final",
    client: "Cliente C",
    desc: "Aguardando feedback do cliente",
    column: "aprovacao",
    urgent: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let currentUser = null;

// FUNÇÃO LOGIN GLOBAL (para botão funcionar)
function login() {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();
  const error = document.getElementById("login-error");

  const found = users.find(u => u.username === user && u.password === pass);

  if (found) {
    currentUser = found;
    localStorage.setItem("currentUserId", found.id);
    document.getElementById("login-container").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    document.getElementById("current-user-name").textContent = currentUser.username;
    updateAvatar();
    loadTasks();
    error.textContent = "";
  } else {
    error.textContent = "Usuário ou senha inválidos.";
  }
}

function logout() {
  localStorage.removeItem("currentUserId");
  document.getElementById("app").classList.add("hidden");
  document.getElementById("login-container").classList.remove("hidden");
  document.getElementById("current-user-name").textContent = "";
  document.getElementById("user-avatar").src = "";
  document.querySelectorAll(".task-list").forEach(list => (list.innerHTML = ""));
  currentUser = null;
}

document.addEventListener("DOMContentLoaded", () => {
  const storedId = localStorage.getItem("currentUserId");
  if (storedId) {
    currentUser = users.find(u => u.id === storedId);
    if (currentUser) {
      document.getElementById("login-container").classList.add("hidden");
      document.getElementById("app").classList.remove("hidden");
      document.getElementById("current-user-name").textContent = currentUser.username;
      updateAvatar();
      loadTasks();
    }
  }

  // Preview da imagem assim que o arquivo for selecionado
  document.getElementById("user-photo-input").addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById("user-avatar-preview").src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  // Criar nova tarefa
  document.getElementById("save-task-btn").onclick = () => {
    const title = document.getElementById("task-title").value.trim();
    const client = document.getElementById("task-client").value.trim();
    const desc = document.getElementById("task-desc").value.trim();
    const fileInput = document.getElementById("task-file");
    const column = document.getElementById("task-column").value;

    if (!title) return alert("Título é obrigatório.");

    const now = new Date().toISOString();

    const task = {
      id: Date.now().toString(),
      title,
      client,
      desc,
      column,
      urgent: false,
      createdAt: now,
      updatedAt: now
    };

    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      task.fileName = file.name;

      const reader = new FileReader();
      reader.onload = function (e) {
        task.fileData = e.target.result;
        finalize();
      };
      reader.readAsDataURL(file);
    } else {
      finalize();
    }

    function finalize() {
      tasks.push(task);
      saveTasks();
      renderTask(task);
      updateTaskCounts();
      closeModal();

      document.getElementById("task-title").value = "";
      document.getElementById("task-client").value = "";
      document.getElementById("task-desc").value = "";
      document.getElementById("task-file").value = "";
    }
  };
});

function saveProfile() {
  const newName = document.getElementById("edit-username").value.trim();
  const fileInput = document.getElementById("user-photo-input");

  if (newName) {
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
      users[userIndex].username = newName;
      currentUser.username = newName;
      document.getElementById("current-user-name").textContent = newName;
    }
  }

  if (fileInput.files.length > 0) {
    const reader = new FileReader();
    const file = fileInput.files[0];

    reader.onload = function (e) {
      const imageData = e.target.result;

      document.getElementById("user-avatar").src = imageData;
      const preview = document.getElementById("user-avatar-preview");
      if (preview) preview.src = imageData;

      const userIndex = users.findIndex(u => u.id === currentUser.id);
      if (userIndex !== -1) {
        users[userIndex].avatar = imageData;
        currentUser.avatar = imageData;
      }

      localStorage.setItem("users", JSON.stringify(users));
      localStorage.setItem("currentUserId", currentUser.id);

      closeUserPopup();
      updateAvatar();
    };

    reader.readAsDataURL(file);
  } else {
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUserId", currentUser.id);
    updateAvatar();
    closeUserPopup();
  }
}

function updateAvatar() {
  const avatar = document.getElementById("user-avatar");

  if (avatar && currentUser) {
    if (currentUser.avatar) {
      avatar.src = currentUser.avatar;
    } else {
      const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.username)}&background=1db954&color=fff&bold=true&rounded=true`;
      avatar.src = fallback;
    }

    const preview = document.getElementById("user-avatar-preview");
    if (preview) {
      preview.src = currentUser.avatar || avatar.src;
    }
  }
}

function showCreateUserForm() {
  closeUserPopup();
  document.getElementById("user-form-title").textContent = "Novo Usuário";
  document.getElementById("form-username").value = "";
  document.getElementById("form-password").value = "";
  document.getElementById("form-role").value = "member";

  document.getElementById("save-user-btn").onclick = () => {
    const name = document.getElementById("form-username").value.trim();
    const pass = document.getElementById("form-password").value.trim();
    const role = document.getElementById("form-role").value;

    if (!name || !pass) return alert("Nome de usuário e senha são obrigatórios.");

    users.push({
      id: "u" + Date.now(),
      username: name,
      password: pass,
      role
    });

    localStorage.setItem("users", JSON.stringify(users));
    closeUserFormModal();
    updateUserList();
  };

  document.getElementById("user-form-modal").classList.remove("hidden");
}

function editUser(index) {
  const user = users[index];
  closeUserPopup();

  document.getElementById("user-form-title").textContent = "Editar Usuário";
  document.getElementById("form-username").value = user.username;
  document.getElementById("form-password").value = user.password;
  document.getElementById("form-role").value = user.role;

  document.getElementById("save-user-btn").onclick = () => {
    user.username = document.getElementById("form-username").value.trim();
    user.password = document.getElementById("form-password").value.trim();
    user.role = document.getElementById("form-role").value;

    localStorage.setItem("users", JSON.stringify(users));
    closeUserFormModal();
    updateUserList();
  };

  document.getElementById("user-form-modal").classList.remove("hidden");
}

function closeUserFormModal() {
  document.getElementById("user-form-modal").classList.add("hidden");
  updateUserList();
}

function updateUserList() {
  const list = document.getElementById("user-list");
  list.innerHTML = "";

  users.forEach((user, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${user.username} (${user.role})
      <span>
        <button onclick="editUser(${index})">Editar</button>
        <button onclick="deleteUser(${index})">Excluir</button>
      </span>`;
    list.appendChild(li);
  });
}

function deleteUser(index) {
  if (confirm("Tem certeza que deseja excluir este usuário?")) {
    users.splice(index, 1);
    localStorage.setItem("users", JSON.stringify(users));
    updateUserList();
  }
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
  document.querySelectorAll(".task-list").forEach(list => list.innerHTML = "");
  tasks.forEach(task => renderTask(task));
  updateTaskCounts();
}

function renderTask(task) {
  const card = document.createElement("div");
  card.className = "task";
  if (task.urgent) card.classList.add("urgent");
  card.id = task.id;
  card.draggable = true;
  card.ondragstart = e => e.dataTransfer.setData("text/plain", task.id);

  card.innerHTML = `
  <div class="card-title-row">
    <strong class="task-title" onclick="openEditModal('${task.id}')">${task.title}</strong>
    <div class="card-header-icons">
      ${task.fileData ? `<a href="${task.fileData}" download="${task.fileName}" title="Download do arquivo"><i class="fa-solid fa-paperclip"></i></a>` : ''}
      <i class="fa-solid fa-check" title="Concluir" onclick="concludeTask('${task.id}')"></i>
      <i class="fa-solid fa-flag ${task.urgent ? 'urgent' : ''}" title="Urgente" onclick="toggleUrgency('${task.id}', this)"></i>
    </div>
  </div>
  ${task.client ? `<p>${task.client}</p>` : ""}
  <div class="card-footer">
    <small title="Criado em"><i class="fa-solid fa-calendar-days"></i> ${formatDate(task.createdAt)}</small>
    <small title="Última atualização"><i class="fa-solid fa-clock"></i> ${formatDate(task.updatedAt)}</small>
    <i class="fa-solid fa-trash" title="Excluir" onclick="deleteTask('${task.id}')"></i>
  </div>`;

  document.getElementById(task.column)?.appendChild(card);
  updateTaskCounts();
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR") + " " + date.toLocaleTimeString("pt-BR").slice(0, 5);
}

function openModal() {
  document.getElementById("modal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  document.getElementById(id)?.remove();
  updateTaskCounts();
}

function toggleUrgency(id, el) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.urgent = !task.urgent;
  saveTasks();

  const card = document.getElementById(id);
  if (card) {
    card.classList.toggle("urgent", task.urgent);
    el.classList.toggle("urgent", task.urgent);
  }

  updateTaskCounts();
}

function concludeTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.column = "concluido";
  task.updatedAt = new Date().toISOString();
  saveTasks();
  document.getElementById(id)?.remove();
  renderTask(task);
}

function openEditModal(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  document.getElementById("edit-modal").classList.remove("hidden");

  document.getElementById("edit-title").value = task.title;
  document.getElementById("edit-client").value = task.client || "";
  document.getElementById("edit-desc").value = task.desc;
  document.getElementById("edit-file").value = "";
  document.getElementById("edit-column").value = task.column;
  document.getElementById("edit-notes").value = task.notes || "";

  const urgencyIcon = document.getElementById("edit-urgency-toggle");
  urgencyIcon.classList.toggle("urgent", !!task.urgent);
  urgencyIcon.title = task.urgent ? "Urgente" : "Não urgente";

  urgencyIcon.onclick = () => {
    task.urgent = !task.urgent;
    urgencyIcon.classList.toggle("urgent", task.urgent);
    urgencyIcon.title = task.urgent ? "Urgente" : "Não urgente";
  };

  document.getElementById("save-edit-btn").onclick = () => {
    task.title = document.getElementById("edit-title").value;
    task.client = document.getElementById("edit-client").value;
    task.desc = document.getElementById("edit-desc").value;
    task.column = document.getElementById("edit-column").value;
    task.notes = document.getElementById("edit-notes").value;
    task.updatedAt = new Date().toISOString();

    const fileInput = document.getElementById("edit-file");
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      task.fileName = file.name;

      const reader = new FileReader();
      reader.onload = function (e) {
        task.fileData = e.target.result;
        finalizeEdit();
      };
      reader.readAsDataURL(file);
    } else {
      finalizeEdit();
    }

    function finalizeEdit() {
      saveTasks();
      closeEditModal();
      document.getElementById(task.id)?.remove();
      renderTask(task);
    }
  };
}

function closeEditModal() {
  document.getElementById("edit-modal").classList.add("hidden");
}

function allowDrop(event) {
  event.preventDefault();
}

function drop(event) {
  event.preventDefault();
  const taskId = event.dataTransfer.getData("text/plain");
  const column = event.target.closest(".column")?.querySelector(".task-list");
  if (column) {
    const card = document.getElementById(taskId);
    if (card) column.appendChild(card);

    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.column = column.id;
      task.updatedAt = new Date().toISOString();
      saveTasks();
      updateTaskCounts();
    }
  }
}

function updateTaskCounts() {
  const counters = document.querySelectorAll(".task-count");
  counters.forEach(span => {
    const columnId = span.dataset.column;
    const count = document.querySelectorAll(`#${columnId} .task`).length;
    span.textContent = count;
  });
}

// Funções para abrir/fechar popup do perfil
function closeUserPopup() {
  document.getElementById("user-popup").classList.add("hidden");
}

document.getElementById("user-avatar").onclick = () => {
  if (!currentUser) return;
  document.getElementById("user-popup").classList.remove("hidden");
  document.getElementById("edit-username").value = currentUser.username;

  const preview = document.getElementById("user-avatar-preview");
  if (preview) preview.src = currentUser.avatar || document.getElementById("user-avatar").src;

  if (currentUser.role === "admin") {
    document.getElementById("admin-user-controls").classList.remove("hidden");
    updateUserList();
  } else {
    document.getElementById("admin-user-controls").classList.add("hidden");
  }
};
