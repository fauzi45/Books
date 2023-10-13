const RENDER_EVENT = 'render-ui'
const STORAGE_KEY = 'bookshelf-apps'
// membuat array books
let BooksofList = []

// load content
document.addEventListener('DOMContentLoaded', () => {
    // membuat notifikasi input karakter maks
    document.getElementById('inputBookYear').addEventListener('input', function () {
      const jumlahKarakterDiketik = document.getElementById('inputBookYear').value.length;
      const jumlahKarakterMaksimal = document.getElementById('inputBookYear').maxLength;
      const sisaKarakterUpdate = jumlahKarakterMaksimal - jumlahKarakterDiketik;
      if (sisaKarakterUpdate === 0) {
        document.getElementById('sisaKarakter').innerText = 'Batas input tahun tercapai!';
      } else if (sisaKarakterUpdate <= 5) {
        document.getElementById('notifikasiSisaKarakter').style.color = 'red';
      } else {
        document.getElementById('notifikasiSisaKarakter').style.color = 'black';
      }
    });
    
    document.getElementById('inputBookYear').addEventListener('focus', function () {
      document.getElementById('notifikasiSisaKarakter').style.visibility = 'visible';
    });

    document.getElementById('inputBookYear').addEventListener('blur', function () {
      document.getElementById('notifikasiSisaKarakter').style.visibility = 'hidden';
    });
    
    // merender tampilan UI
    document.addEventListener(RENDER_EVENT, () => {
        const bookshelfCompletedRead = document.getElementById('completeBookshelfList')
        const bookshelfInCompletedRead = document.getElementById('incompleteBookshelfList')

        bookshelfCompletedRead.innerHTML = ''
        bookshelfInCompletedRead.innerHTML = ''

        let totalBookCompleted = 0
        let totalBookInCompleted = 0

        for (const book of BooksofList) {
            const elementBooks = generateElementBooks(book)

            if (book.isComplete) {
                totalBookCompleted++
                bookshelfCompletedRead.append(elementBooks)
            } else {
                totalBookInCompleted++
                bookshelfInCompletedRead.append(elementBooks)
            }
        }

        // jika buku kosong maka
        if (totalBookCompleted == 0) {
            bookshelfCompletedRead.append(generateElementEmptyState(true))
        } if (totalBookInCompleted == 0) {
            bookshelfInCompletedRead.append(generateElementEmptyState(false))
        }
    });

    //function untuk simpan data
    const simpanData = document.getElementById("bookSubmit");
    simpanData.addEventListener('click', (event) => {
        event.preventDefault()
        saveSuccess()
        saveData()        
    })

    // cek kondisi value local storage
    if (localStorage.getItem(STORAGE_KEY) === null)
        saveDataToLocalStorage()
    // load data from local storage
    loadDataFromLocalStorage()
})

// cek jika local storage support web
function checkStorageIsExists() {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

// membuat id dengan tipe data timestamp
function generateId() {
    return +new Date()
}

// mendapatkan element container
function getElementContainer() {
    const containerInput = document.getElementById('input_section')
    const containerSearch = document.getElementById('search_section')
    const containerBookShelfComplete = document.getElementById('book_shelf_complete')
    const conatinerBookShelfInComplete = document.getElementById('book_shelf_incomplete')
    const containerEdit = document.getElementById("edit_section")
    return {containerInput, containerSearch, containerBookShelfComplete, conatinerBookShelfInComplete, containerEdit}
}



// mendapat element dari input form
function getElementInputForm() {
    const title = document.getElementById('inputBookTitle')
    const author = document.getElementById('inputBookAuthor')
    const year = document.getElementById('inputBookYear')
    const isComplete = document.getElementById('inputBookIsComplete')
    const inputBookId = document.getElementById('inputBookId')

    return {title, author, year, isComplete, inputBookId}
}

// membuat element jika element kosong
function generateElementEmptyState(isComplete) {
    const container = document.createElement('div')
    const message = document.createElement('p')

    message.innerHTML = '&#9888; Belum ada daftar buku pada rak <span>Belum Selesai Dibaca</span>'
    if (isComplete) {
        message.innerHTML = '&#9888; Belum ada daftar buku pada rak <span>Selesai Dibaca</span>'
    }

    container.classList.add('empty-state')
    container.append(message)

    return container
}

// membuat element list book
function generateElementBooks(bookObject) {
    const article = document.createElement('article')
    const title = document.createElement('h3')
    const author = document.createElement('p')
    const year = document.createElement('p')
    const actionContainer = document.createElement('div')
    const btnEditStatus = document.createElement('button')
    const btnEdit = document.createElement('button')
    const btnDelete = document.createElement('button')

    btnEdit.innerText = 'Ubah Buku'
    btnDelete.innerText = 'Hapus Buku'
    let isComplete = 1
    if (bookObject.isComplete) {
        btnEditStatus.innerText = 'Belum selesai dibaca'
        isComplete = 0
    } else {
        btnEditStatus.innerText = 'Selesai dibaca'
    }

    btnEditStatus.classList.add('primary')
    btnEdit.classList.add('info')
    btnDelete.classList.add('secondary')
    // action untuk tombol edit buku
    btnEdit.addEventListener('click', () => {
        updateData(bookObject.id);

    })
    // action untuk tombol edit status buku
    btnEditStatus.addEventListener('click', () => {
        updateStatusData(bookObject.id, isComplete)
    })
    // action untuk tombol delete buku
    btnDelete.addEventListener('click', () => {
        deleteData(bookObject.id)
    })

    // menambahkan element dibawah element yang sudah ada
    actionContainer.classList.add('action')
    actionContainer.append(btnEditStatus, btnEdit, btnDelete)

    // memasukkan value object ke element
    title.innerText = bookObject.title
    author.innerText = `Penulis : ${bookObject.author}`
    year.innerText = `Tahun : ${bookObject.year}`

    // menambahkan semua child ke parent
    article.setAttribute('id', `book-${bookObject.id}`)
    article.classList.add('book_item')
    article.append(title, author, year, actionContainer)

    return article
}

// membuat function edit buku
function editData(){
    const {title, author, year, isComplete, inputBookId} = getElementInputForm()
    const data = {
        title: title.value,
        author: author.value,
        year: +year.value,
        isComplete: isComplete.checked,
    }

    if (inputBookId.value) {
        // find book by id
        const findIndexBook = findBookIndex(inputBookId.value)
        data.id = inputBookId.value
        BooksofList.splice(findIndexBook, 1, data)
    } 
    saveDataToLocalStorage()
    resetForm()
    document.dispatchEvent(new Event(RENDER_EVENT))
}

// membuat function simpan buku
function saveData() {
    const {title, author, year, isComplete, inputBookId} = getElementInputForm()
    const data = {
        title: title.value,
        author: author.value,
        year: +year.value,
        isComplete: isComplete.checked,
    }
        
    const generatedId = generateId()
    data.id = generatedId
    BooksofList.push(data)

    saveDataToLocalStorage()
    resetForm()
    document.dispatchEvent(new Event(RENDER_EVENT))
}

// membuat function reset form
function resetForm() {
    const {title, author, year, isComplete, inputBookId} = getElementInputForm()
    inputBookId.value = ''
    title.value = ''
    author.value = ''
    year.value = ''
    isComplete.checked = false
}

// mengload data dari local storage
function loadDataFromLocalStorage() {
    try {
        if (checkStorageIsExists) {
            BooksofList = []
            const serializedData = localStorage.getItem(STORAGE_KEY)

            if (serializedData == null) return

            let dataParsed = JSON.parse(serializedData)
            for (const book of dataParsed) {
                BooksofList.push(book)
            }
            
            document.dispatchEvent(new Event(RENDER_EVENT))
        }
    } catch(error) {
        alert(error.message)
    }
}

// membuat function simpan data ke local storage
function saveDataToLocalStorage() {
    if (checkStorageIsExists) {
        const parsedData = JSON.stringify(BooksofList)
        localStorage.setItem(STORAGE_KEY, parsedData)
    }
}

// membuat function edit status buku

function updateStatusData(id, status) {
    const findDataBook = findBook(id)
    
    if (findDataBook === null) return

    const confirmation = confirm('Apakah kamu yakin akan mengubah buku menjadi ' + (status ? 'Sudah dibaca' : 'Belum dibaca') + ' ?')

    if (confirmation) {
        findDataBook.isComplete = status
        saveDataToLocalStorage()
        document.dispatchEvent(new Event(RENDER_EVENT))
    }
}

// membuat function delete buku

function deleteData(id) {
    const detailBook = findBook(id)
    const confirmation = confirm(`Apakah kamu yakin akan menghapus buku dengan judul ${detailBook.title} ?`)

    if (confirmation) {
        loadDataFromLocalStorage()
        const findIndexBook = findBookIndex(id)

        if (findIndexBook === -1) return

        BooksofList.splice(findIndexBook, 1)
        const keyword = document.getElementById('searchBookTitle')
        keyword.value = ''
        deleteSuccess()
        saveDataToLocalStorage()
        document.dispatchEvent(new Event(RENDER_EVENT))
    }
}

// membuat function edit buku
function updateData(id){
    const detailBook = findBook(id)
    const updated = document.getElementById("update");
    const book = document.getElementById("bookSubmit");
    const edited = document.getElementById("editbuku");
    const inputed = document.getElementById("inputbuku");
    
    inputed.style.display = "none";
    book.style.display = "none";
    updated.style.display = "block";
    edited.style.display = "block";

    const {title, author, year, isComplete, inputBookId} = getElementInputForm()
    
    inputBookId.value = detailBook.id
    title.value = detailBook.title
    author.value = detailBook.author
    year.value = detailBook.year
    isComplete.checked = detailBook.isComplete
        
    updated.addEventListener("click", (event) => {
        event.preventDefault()
        updateSuccess()
        editData()
        inputed.style.display = "block";
        book.style.display = "block";
        updated.style.display = "none";
        edited.style.display = "none";
    })    
}

// membuat function search buku
const keyword = document.getElementById('searchBookTitle')
const searchBook = document.getElementById('searchSubmit')
searchBook.addEventListener('click', (event) => {
    loadDataFromLocalStorage()
    if (keyword.value) {
        BooksofList = findBookByKeyword(keyword.value)
    }
    event.preventDefault()
    document.dispatchEvent(new Event(RENDER_EVENT))
})

// membuat function edit buku dari keyword
function findBookByKeyword(keyword) {
    let searchBooksResult = []
    for (const book of BooksofList) {
        if (book.title.toLowerCase().includes(keyword.toLowerCase())) {
            searchBooksResult.push(book)
        }
    }  
    return searchBooksResult
}

// find book by id
function findBook(id) {
    for (const book of BooksofList) {
        if (id === book.id) {
            return book
        }
    }
    return null
}

// find book index by id
function findBookIndex(id) {
    for (const index in BooksofList) {
        if (BooksofList[index].id == id) {
            return index
        }
    }
    return -1
}
// membuat alert delete
function deleteSuccess() {
    swal({
         title: "Berhasil!",
         text: "Data berhasil dihapus",
         icon: "success",
         button: true
     });
 }

// membuat alert update
 function updateSuccess() {
    swal({
         title: "Berhasil!",
         text: "Data berhasil di Update",
         icon: "success",
         button: true
     });
 }

 // membuat alert simpan
 function saveSuccess() {
    swal({
         title: "Berhasil!",
         text: "Data berhasil di simpan",
         icon: "success",
         button: true
     });
 }