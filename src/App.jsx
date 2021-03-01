const productTableHeadings = ['Product Name', 'Price', 'Category', 'Image'];
const NO_DATA_AVAILABLE = 'No Data Available';

/**
 * Renders a single Row in the Product table
 * @param props Expects props as a 'product' object which contains name, price, category and imageUrl.
 */
function ProductTableRow(props) {
    const { name, price, category, imageUrl } = props.product;
    return (
        <tr>
            <td>{name || NO_DATA_AVAILABLE}</td>
            <td>{price ? `${price}` : NO_DATA_AVAILABLE}</td>
            <td>{category}</td>
            <td>{imageUrl ? <a href={imageUrl} target="_blank">View</a> : NO_DATA_AVAILABLE}</td>
        </tr>
    );
}

/**
 * Renders the Product Table
 * @param props Expects 'headings' and 'products' array as props
 */
function ProductTable(props) {
    const { headings, products } = props;
    const productTableRows = products.map((product) => <ProductTableRow key={product.id} product={product} />);

    return (
        <table className="table">
            <thead>
                <tr>
                    {headings.map((heading, index) => {
                        // using index as keys as Table Headings will not change dynamically
                        return <th key={index}>{heading}</th>
                    })}
                </tr>
            </thead>

            <tbody>
                {products.length > 0 ? productTableRows : (
                    <tr className="text-center"><td colSpan="4">No Products added yet</td></tr>
                )}
            </tbody>
        </table>
    )
}

/**
 * Product Add Form.
 * Expects 'addProduct' function as a prop.
 * Uses a controlled state for 'Price' input element for adding '$'.
 * And for rest of the elements, it uses native 'forms' object from DOM.
 */
class ProductAdd extends React.Component {
    constructor() {
        super();
        this.state = {
            price: '$',
        }
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handlePriceChange = this.handlePriceChange.bind(this);
    }

    handleSubmit(event) {
        event.preventDefault();

        const { name, price, category, imageUrl } = document.forms.productAdd;
        const priceWithoutDollar = price.value.substring(1); // Getting value without '$'

        const product = {
            name: name.value,
            price: parseFloat(priceWithoutDollar),
            category: category.value,
            imageUrl: imageUrl.value
        }
        this.props.addProduct(product);

        // Resetting the Form to initial value
        name.value = '';
        category.value = 'Shirts';
        imageUrl.value = '';
        this.setState({ price: '$' });
    }

    handlePriceChange(event) {
        const priceWithoutDollar = event.target.value.substring(1); // Getting value without '$'
        this.setState({ price: `$${priceWithoutDollar}` })
    }

    render() {
        return (
            <form name="productAdd" onSubmit={this.handleSubmit} className="custom-form">
                <div className="form-element">
                    <label htmlFor="category">Category</label>
                    <select name="category">
                        <option value="Shirts">Shirts</option>
                        <option value="Jeans">Jeans</option>
                        <option value="Jackets">Jackets</option>
                        <option value="Sweaters">Sweaters</option>
                        <option value="Accessories">Accessories</option>
                    </select>
                </div>

                <div className="form-element">
                    <label htmlFor="price">Price Per Unit</label>
                    <input type="text" name="price" value={this.state.price} onChange={this.handlePriceChange} />
                </div>

                <div className="form-element">
                    <label htmlFor="name">Product Name</label>
                    <input type="text" name="name" />
                </div>

                <div className="form-element">
                    <label htmlFor="imageUrl">Image URL</label>
                    <input type="text" name="imageUrl" />
                </div>

                <button type="submit" className="button button-dark">Add Product</button>
            </form>
        )
    }
}

/**
 * Generic function to fetch graphQL queries and mutations
 * @param query GraphQL query to be sent in the body
 * @param variables Query variable to be passed with the query. Defaults to {}
 */
async function graphQLFetch(query, variables = {}) {
    try {
        const response = await fetch('/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables })
        });
        const result = await response.json();

        if (result.errors) {
            const error = result.errors[0];
            alert('Error while quering for data - ', error);
        }
        return result.data;
    } catch (e) {
        alert(`Error in sending data to server: ${e.message}`);
    }
}

/**
 * Entry Point of our Application. Renders the whole page from here.
 */
class ProductList extends React.Component {
    constructor() {
        super();
        this.state = { products: [] };
        this.addProduct = this.addProduct.bind(this);
    }

    componentDidMount() {
        this.loadData();
    }

    async loadData() {
        const query = `
            query {
                productList {
                    id
                    name
                    category
                    price
                    imageUrl
                }
            }
        `;

        const data = await graphQLFetch(query);

        if (data) {
            this.setState({ products: data.productList });
        }
    }

    async addProduct(product) {
        const query = `
            mutation addProduct($product: ProductInputs!) {
                addProduct(product: $product) {
                    id
                }
            }
        `;

        const data = await graphQLFetch(query, { product });
        if (data) {
            this.loadData();
        }
    }

    render() {
        return (
            <React.Fragment>
                <div className="container">
                    <h2>My Company Inventory</h2>
                    <div>Showing all available products</div>
                    <hr />
                    <ProductTable headings={productTableHeadings} products={this.state.products} />
                    <div>Add a new Product</div>
                    <hr />
                    <ProductAdd addProduct={this.addProduct} />
                </div>
            </React.Fragment>
        );
    }
}

const element = (<ProductList />);

ReactDOM.render(element, document.getElementById('contents'));
