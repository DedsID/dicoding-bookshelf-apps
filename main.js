/**
 * [
 *    {
 *      id: string | number,
 *      title: string,
 *      author: string,
 *      year: number,
 *      isComplete: boolean,
 *    }
 * ]
 */
const bookshelf = [];
const RENDER_EVENT = "render-bs";
const SAVED_EVENT = "saved-bs";
const STORAGE_KEY = "BS_APPS";

function generateId() {
  return +new Date();
}

function generateBookList(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted
  };
}

function findBook(bookId) {
  for (const bookItem of bookshelf) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in bookshelf) {
    if (bookshelf[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function isStorageExist() /* boolean */ {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed /* string */ = JSON.stringify(bookshelf);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage() {
  const serializedData /* string */ = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      bookshelf.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function makeBookList(bookObject) {
  const { id, title, author, year, isCompleted } = bookObject;

  const textTitle = document.createElement("h3");
  textTitle.innerText = title;

  const textAuthor = document.createElement("p");
  textAuthor.innerText = `Penulis: ${author}`;

  const textYear = document.createElement("p");
  textYear.innerText = `Tahun: ${year}`;

  const container = document.createElement("article");
  container.classList.add("book_item");
  container.appendChild(textTitle);
  container.appendChild(textAuthor);
  container.appendChild(textYear);

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("action");

  if (isCompleted) {
    const belumButton = document.createElement("button");
    belumButton.classList.add("green");
    belumButton.innerText = "Belum selesai dibaca";
    belumButton.addEventListener("click", function () {
      undoTaskFromCompleted(id);
    });
    buttonContainer.appendChild(belumButton);
  } else {
    const sudahButton = document.createElement("button");
    sudahButton.classList.add("green");
    sudahButton.innerText = "Selesai dibaca";
    sudahButton.addEventListener("click", function () {
      addTaskToCompleted(id);
    });
    buttonContainer.appendChild(sudahButton);
  }

  const hapusButton = document.createElement("button");
  hapusButton.classList.add("red");
  hapusButton.innerText = "Hapus buku";
  hapusButton.addEventListener("click", function () {
    showDeleteConfirmation(bookObject.id);
  });

  buttonContainer.appendChild(hapusButton);

  container.appendChild(buttonContainer);

  return container;
}

function showDeleteConfirmation(bookID) {
  const deleteDialog = document.getElementById("deleteDialog");
  const deleteCancelButton = document.getElementById("deleteCancelButton");
  const deleteConfirmButton = document.getElementById("deleteConfirmButton");
  const overlay = document.getElementById("overlay");
  const body = document.body; // Element body

  // Tambahkan event listener untuk tombol Batal
  deleteCancelButton.addEventListener("click", function () {
    deleteDialog.style.display = "none"; // Sembunyikan modal dialog
    overlay.style.display = "none"; // Sembunyikan overlay
    body.style.overflow = "auto"; // Aktifkan scroll di body
  });

  // Tambahkan event listener untuk tombol Hapus
  deleteConfirmButton.addEventListener("click", function () {
    // Panggil fungsi untuk menghapus buku setelah konfirmasi
    removeTaskFromCompleted(bookID);
    deleteDialog.style.display = "none"; // Sembunyikan modal dialog setelah menghapus
    overlay.style.display = "none"; // Sembunyikan overlay
    body.style.overflow = "auto"; // Aktifkan scroll di body
  });

  // Tampilkan modal dialog
  deleteDialog.style.display = "block";
  overlay.style.display = "block"; // Tampilkan overlay
  body.style.overflow = "hidden"; // Nonaktifkan scroll di body

  overlay.addEventListener("click", function () {
    deleteDialog.style.display = "none"; // Sembunyikan modal dialog
    overlay.style.display = "none"; // Sembunyikan overlay
    body.style.overflow = "auto"; // Aktifkan scroll di body
  });
}

function addBook() {
  const inputTitle = document.getElementById("inputBookTitle").value;
  const inputAuthor = document.getElementById("inputBookAuthor").value;
  const inputYear = document.getElementById("inputBookYear").valueAsNumber; // Mengambil nilai sebagai number
  const inputIsCompleted = document.getElementById("inputBookIsComplete")
    .checked;

  const generatedID = generateId();
  const bookObject = generateBookList(
    generatedID,
    inputTitle,
    inputAuthor,
    inputYear,
    inputIsCompleted
  );

  bookshelf.push(bookObject);

  // Setelah menambahkan buku, reset nilai kolom input
  inputTitle.value = "";
  inputAuthor.value = "";
  inputYear.value = "";
  inputIsCompleted.checked = false;

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addTaskToCompleted(bookID /* HTMLELement */) {
  const bookTarget = findBook(bookID);

  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeTaskFromCompleted(bookID /* HTMLELement */) {
  const bookTarget = findBookIndex(bookID);

  if (bookTarget === -1) return;

  bookshelf.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoTaskFromCompleted(bookID /* HTMLELement */) {
  const bookTarget = findBook(bookID);
  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

document.addEventListener("DOMContentLoaded", function () {
  const submitForm /* HTMLFormElement */ = document.getElementById("inputBook");

  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }

  const searchForm = document.getElementById("searchBook");
  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    searchBooks();
  });
});

document.addEventListener(SAVED_EVENT, () => {
  console.log("Data berhasil di simpan.");
});

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBookList = document.getElementById(
    "incompleteBookshelfList"
  );
  const listCompleted = document.getElementById("completeBookshelfList");

  // clearing list item
  uncompletedBookList.innerHTML = "";
  listCompleted.innerHTML = "";

  for (const bookItem of bookshelf) {
    const bookElement = makeBookList(bookItem);
    if (bookItem.isCompleted) {
      listCompleted.append(bookElement);
    } else {
      uncompletedBookList.append(bookElement);
    }
  }
});

function searchBooks() {
  const searchTitle = document
    .getElementById("searchBookTitle")
    .value.toLowerCase();
  const uncompletedBookList = document.getElementById(
    "incompleteBookshelfList"
  );
  const listCompleted = document.getElementById("completeBookshelfList");

  // Clear existing book lists
  uncompletedBookList.innerHTML = "";
  listCompleted.innerHTML = "";

  for (const bookItem of bookshelf) {
    const bookElement = makeBookList(bookItem);
    const title = bookItem.title.toLowerCase();

    // Jika judul buku cocok dengan pencarian, tambahkan ke daftar yang sesuai
    if (title.includes(searchTitle)) {
      if (bookItem.isCompleted) {
        listCompleted.appendChild(bookElement);
      } else {
        uncompletedBookList.appendChild(bookElement);
      }
    }
  }
}
