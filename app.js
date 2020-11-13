//SWIPER SETTING
document.addEventListener("DOMContentLoaded", () => {
	const swiper = new Swiper(".swiper-container", {
		effect: "coverflow",
		grabCursor: true,
		centeredSlides: true,
		slidesPerView: "auto",
		coverflowEffect: {
			rotate: 60,
			stretch: 0,
			depth: 150,
			modifier: 1,
			slideShadows: true,
		},
	});
});
//BOOK CLASS

class Book {
	constructor(url, cover, title, author, pages, isbn) {
		this.url = url;
		this.cover = cover;
		this.title = title;
		this.author = author;
		this.pages = pages;
		this.isbn = isbn;
	}
}

//UI CLASS
class UI {
	static displayBooks() {
		const books = Storage.getBooks();

		books.forEach((book) => UI.addBookToList(book));
	}

	static addBookToList(book) {
		//INIT SWIPER ONLY AFTER ADDING BOOKS
		let swiper = document.querySelector(".swiper-container").swiper;

		swiper.appendSlide(`
        <div class="swiper-slide">
            <div class="book-cover">
                <img src="${book.cover}" alt="" />
            </div>
            <div class="book-info">
                <h2 class="book-title">${book.title}</h2>
                <h3 class="book-author">By ${book.author}</h3>
                <p class="book-pages">Pages: ${book.pages}</p>
                <p>${book.isbn}</p>
            </div>
 
            <div class="cta-buttons">
                <a href="${book.url}" class="read-more btn" target="_blank">Read More</a>
                <a href="#" class="delete btn">Remove Book</a>
            </div>
        </div>
        `);

		swiper.update();
	}

	static deleteBook(element) {
		if (element.classList.contains("delete")) {
			element.parentElement.parentElement.remove();
		}

		//INIT SWIPER ONLY AFTER ADDING BOOKS
		let swiper = document.querySelector(".swiper-container").swiper;
		swiper.update();
	}

	static clearFields() {
		document.querySelector("#result-form").reset();
	}
}
// STORAGE CLASS
class Storage {
	static getBooks() {
		let books;
		if (localStorage.getItem("books") === null) {
			books = [];
		} else {
			books = JSON.parse(localStorage.getItem("books"));
		}

		return books;
	}

	static addBook(book) {
		const books = Storage.getBooks();

		books.push(book);

		localStorage.setItem("books", JSON.stringify(books));
	}

	static removeBook(isbn) {
		const books = Storage.getBooks();

		books.forEach((book, index) => {
			if (book.isbn === isbn) {
				books.splice(index, 1);
			}
		});

		localStorage.setItem("books", JSON.stringify(books));
	}
}

//EVENT: DISPLAY BOOKS

document.addEventListener("DOMContentLoaded", UI.displayBooks);

//EVENT ADD A BOOK
function getMovies(searchText) {
	axios
		.get(
			`https://openlibrary.org/api/books?bibkeys=ISBN:${searchText}&format=json&jscmd=data`
		)
		.then((response) => {
			console.log(response);
			let path = `ISBN:${searchText}`;
			let data = response.data[`${path}`];

			let cover;
			if (data.cover) {
				cover = data.cover.medium;
			} else {
				cover = "./imgs/book-cover-placeholder.png";
			}
			let url = data.url;
			let title = data.title;
			let author = data.authors[0].name;
			let pages = data.number_of_pages;
			let isbn = searchText;

			const book = new Book(url, cover, title, author, pages, isbn);

			// ADD BOOK TO THE UI
			UI.addBookToList(book);

			//ADD BOOK TO LOCAL STORAGE
			Storage.addBook(book);
		})
		.catch((err) => {
			console.log(err);
		});
}

// EVENT: REMOVE A BOOK

document.querySelector(".swiper-wrapper").addEventListener("click", (e) => {
	// DELETE BOOK FROM UI
	UI.deleteBook(e.target);

	//DELETE BOOK FROM LOCAL STORAGE
	Storage.removeBook(
		e.target.parentElement.previousElementSibling.lastElementChild.textContent
	);
});

//SCANNER CODE
document.getElementById("start-button").addEventListener("click", function () {
	document.getElementById("search-input").value = "";
	let selectedDeviceId;
	const codeReader = new ZXing.BrowserBarcodeReader();
	console.log("ZXing code reader initialized");

	//GET THE VIDEO DEVICE
	codeReader
		.getVideoInputDevices()
		.then((videoInputDevices) => {
			const sourceSelect = document.getElementById("sourceSelect");

			if (videoInputDevices.length > 1) {
				videoInputDevices.forEach((device) => {
					const sourceOption = document.createElement("option");
					sourceOption.text = device.label;
					sourceOption.value = device.deviceId;
					sourceSelect.appendChild(sourceOption);
				});

				sourceSelect.onchange = () => {
					selectedDeviceId = sourceSelect.value;
				};

				// const sourceSelectPanel = document.getElementById("sourceSelectPanel");
				// sourceSelectPanel.style.display = "block";
			} else {
				selectedDeviceId = videoInputDevices[0].deviceId;
			}

			//DECODE BARCODE FROM CAMERA
			(() => {
				codeReader
					.decodeOnceFromVideoDevice(selectedDeviceId, "video")
					.then((result) => {
						let searchText = result.text;

						console.log(result);
						document.getElementById("search-input").value = searchText;
					})
					.catch((err) => {
						console.error(err);
					});
			})();

			document.getElementById("stop-button").addEventListener("click", () => {
				codeReader.reset();
				console.log("Reset.");
			});
		})
		.catch((err) => {
			console.error(err);
		});
});

document.addEventListener("DOMContentLoaded", () => {
	//GET MOVIES WHEN ADD BUTTON IS CLICKED
	document.getElementById("add-button").addEventListener("click", () => {
		const searchText = document.getElementById("search-input").value;
		if (!searchText) return;

		getMovies(searchText);

		UI.clearFields();
	});
});
