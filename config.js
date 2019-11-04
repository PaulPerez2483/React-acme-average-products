document.title = 'Endpoints';

const tools = {
    Component: React.Component,
    render: ReactDOM.render,
    root: document.getElementById('root'),
    HashRouter: ReactRouterDOM.HashRouter,
    Link: ReactRouterDOM.Link,
    Route: ReactRouterDOM.Route,
    Switch: ReactRouterDOM.Switch,
    Redirect: ReactRouterDOM.Redirect
}

const { Component, render, tool, HashRouter, Link, Route, Switch, Redirect } = tools;

const Company = (props) => {
    const { data } = props;
    let average;
    let x;
    if (Array.isArray(data)) {
        x = data.reduce((acc, el) => acc + el.suggestedPrice
            , 0) / data.length;


        average = x.toFixed(2);

    }
    return (
        <div>
            <h2>Company</h2>
            <p>we have {data.length} products with an average price of {average} </p>
        </div>
    )
}

const Products = (props) => {
    const { data } = props

    return (
        <div>
            <h2>Company</h2>
            {
                data.map((el, idx) => {
                    // console.log(el.offerings)
                    let arr = el.offerings.map(p => p.price);
                    let sum = arr.reduce((acc, el) => {
                        return acc + el
                    }, 0) / arr.length;

                    let lowest = el.offerings.sort((a, b) => {
                        return a.price - b.price
                    });

                    const { price, company } = lowest[0];

                    return <ul>
                        <li key={idx + 1}>Product: {el.name}</li>
                        <li key={idx + 10}>Suggested Price: {el.suggestedPrice.toFixed(2)}</li>
                        <li key={idx + 40}>Average Price: {sum.toFixed(2)}</li>
                        <li key={idx + 60}>Lowest Price: {price} offered by {company}</li>
                    </ul>
                })
            }


        </div>
    )

}
const Nav = (props) => {
    const { pathname } = props.location;
    console.log(pathname)
    return (
        <ul className='Nav'>
            <li><Link to='/company' className={pathname === '/company' ? 'selected' : ''}>Company</Link></li>
            <li><Link to='/products' className={pathname === '/products' ? 'selected' : ''}>Products</Link></li>
        </ul>

    )
}

const apiLink = 'https://acme-users-api-rev.herokuapp.com/api/';

function averageProducts(companies, products, offerings) {
    // console.log('companies: ', companies)
    // console.log('products: ', products);
    // console.log('offerings: ', offerings)

    const data = products.map(product => {
        return {
            suggestedPrice: product.suggestedPrice,
            name: product.name,
            offerings: offerings.filter(offering => offering.productId === product.id)
                .map(offering => {
                    return {
                        price: offering.price,
                        company: companies.find(company => company.id === offering.companyId)
                    }
                }).map(el => {
                    return {
                        ...el,
                        company: el.company.name
                    }
                })

        }
    });
    return data;
}


class App extends Component {
    state = {
        data: [],
        err: '',
    }

    async  componentDidMount() {

        await Promise.all(['companies', 'products', 'offerings'].map(endpoints => fetch(`${apiLink}${endpoints}`)))
            .then(response => Promise.all(response.map(api => api.json())))
            .then(data => {
                const companies = data[0];
                const products = data[1];
                const offerings = data[2];
                let finalD = averageProducts(companies, products, offerings)
                // console.log('line 120 : ', finalD)
                this.setState({ data: finalD })
            })
            .catch(err => this.setState({ err }))

    }
    render() {
        const { data } = this.state;
        // console.log('line 126 : ', data)
        return (
            <div>
                <h1>Acme Product Averages React</h1>
                <HashRouter>
                    <Route component={Nav} />
                    <Switch>
                        <Route path='/company' render={() => <Company data={data} />} />
                        <Route path='/products' render={() => <Products data={data} />} />
                        <Redirect to='/company' />
                    </Switch>
                </HashRouter>
            </div>
        )
    }
}

render(<App />, root)