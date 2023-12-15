/* app.js */

let carrito = [];
let total = 0;
let productos = [];

async function cargarProductosDesdeJSON() {
  try {
    const response = await fetch('productos.json');
    if (!response.ok) {
      throw new Error('No se pudieron cargar los productos.');
    }
    productos = await response.json();
  } catch (error) {
    mostrarError('Error al cargar los productos.');
  }
}

function guardarCarritoEnLocalStorage() {
  try {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    localStorage.setItem('total', total.toString());
  } catch (error) {
    mostrarError('Error al guardar en el almacenamiento local.');
  }
}

function cargarCarritoDesdeLocalStorage() {
  try {
    const carritoGuardado = localStorage.getItem('carrito');
    const totalGuardado = localStorage.getItem('total');

    if (carritoGuardado && totalGuardado) {
      carrito = JSON.parse(carritoGuardado);
      total = parseFloat(totalGuardado);
    }
  } catch (error) {
    mostrarError('Error al cargar desde el almacenamiento local.');
  }
}

function limpiarCarrito() {
  carrito = [];
  total = 0;
  guardarCarritoEnLocalStorage();
}

function mostrarProductos() {
  const catalogoElement = document.getElementById("catalogo");

  const productosVisibles = catalogoElement.querySelector(".card-container");

  if (productosVisibles) {
    catalogoElement.removeChild(productosVisibles);
  } else {
    try {
      const cardContainer = document.createElement("div");
      cardContainer.classList.add("card-container");

      productos.forEach((producto) => {
        const card = document.createElement("div");
        card.classList.add("card");

        const titulo = document.createElement("h3");
        titulo.textContent = producto.nombre;

        const imagen = document.createElement("img");
        imagen.src = `images/${producto.id}.jpg`;
        imagen.alt = producto.nombre;
        imagen.classList.add("producto-imagen");
        imagen.style.width = "200px";
        imagen.style.height = "200px";

        const descripcion = document.createElement("p");
        descripcion.classList.add("descripcion");
        descripcion.textContent = `Precio: $${producto.precio}`;

        const agregarBtn = document.createElement("button");
        agregarBtn.classList.add("btn", "btn-agregar");
        agregarBtn.textContent = "Agregar al carrito";

        agregarBtn.addEventListener("click", () => agregarDesdeElCard(producto));

        card.appendChild(titulo);
        card.appendChild(imagen);
        card.appendChild(descripcion);
        card.appendChild(agregarBtn);

        cardContainer.appendChild(card);
      });

      catalogoElement.appendChild(cardContainer);
      cargarCarritoDesdeLocalStorage();
    } catch (error) {
      mostrarError('Error al mostrar productos.');
    }
  }
}

function agregarDesdeElCard(producto) {
  try {
    carrito.push(producto);
    total += producto.precio;
    mostrarExito(`${producto.nombre} ha sido agregado al carrito.`);
    guardarCarritoEnLocalStorage();
  } catch (error) {
    mostrarError('Error al agregar al carrito.');
  }
}

function agregarAlCarrito() {
  try {
    Swal.fire({
      title: 'Ingrese el ID del producto',
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Agregar al Carrito',
      cancelButtonText: 'Cancelar',
      showLoaderOnConfirm: true,
      preConfirm: (productoID) => {
        if (!Number.isNaN(parseInt(productoID))) {
          return parseInt(productoID);
        } else {
          Swal.showValidationMessage('Por favor, ingrese un ID válido.');
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        const producto = productos.find((p) => p.id === result.value);
        if (producto) {
          carrito.push(producto);
          total += producto.precio;
          mostrarExito(`${producto.nombre} ha sido agregado al carrito.`);
          guardarCarritoEnLocalStorage();
        } else {
          mostrarError('Producto no encontrado. Intente de nuevo.');
        }
      }
    });
  } catch (error) {
    mostrarError('Error al agregar al carrito.');
  }
}

function mostrarCarrito() {
  const carritoElement = document.getElementById("carrito");
  const verCarritoBtn = document.getElementById("verCarritoBtn");

  verCarritoBtn.classList.toggle("activo");

  try {
    carritoElement.innerHTML = "<strong>Carrito de compras:</strong>";

    carrito.forEach((producto) => {
      const productoDiv = document.createElement("div");
      productoDiv.classList.add("carrito-item");

      const imagen = document.createElement("img");
      imagen.src = `images/${producto.id}.jpg`;
      imagen.alt = producto.nombre;
      imagen.classList.add("carrito-imagen");

      const infoDiv = document.createElement("div");
      infoDiv.classList.add("carrito-info");

      const nombreP = document.createElement("p");
      nombreP.textContent = `Nombre: ${producto.nombre}`;

      const precioP = document.createElement("p");
      precioP.textContent = `Precio: $${producto.precio}`;

      infoDiv.appendChild(nombreP);
      infoDiv.appendChild(precioP);

      productoDiv.appendChild(imagen);
      productoDiv.appendChild(infoDiv);

      carritoElement.appendChild(productoDiv);
    });

    carritoElement.innerHTML += `<p>Total: $${total}`;

    cargarCarritoDesdeLocalStorage();
  } catch (error) {
    mostrarError('Error al mostrar el carrito.');
  }
}

function mostrarExito(mensaje) {
  Swal.fire({
    title: 'Éxito',
    text: mensaje,
    icon: 'success',
    confirmButtonText: 'OK'
  });
}

function mostrarError(mensaje) {
  Swal.fire({
    title: 'Error',
    text: mensaje,
    icon: 'error',
    confirmButtonText: 'OK'
  });
}

document.addEventListener("DOMContentLoaded", function () {
  cargarProductosDesdeJSON();

  const mostrarBtn = document.getElementById("mostrarBtn");
  const agregarBtn = document.getElementById("agregarBtn");
  const verCarritoBtn = document.getElementById("verCarritoBtn");
  const salirBtn = document.getElementById("salirBtn");

  mostrarBtn.addEventListener("click", mostrarProductos);
  agregarBtn.addEventListener("click", agregarAlCarrito);
  verCarritoBtn.addEventListener("click", mostrarCarrito);
  salirBtn.addEventListener("click", function () {
    limpiarCarrito();
    mostrarExito("Gracias por su compra.");
  });

  cargarCarritoDesdeLocalStorage();
});
