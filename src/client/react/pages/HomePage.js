import React, { Component } from "react";
import { Helmet } from "react-helmet";

class HomePage extends Component {
	componentDidMount() {
		console.log("test");
	}
	renderHead = () => (
		<Helmet>
			<title>Hello</title>
			<meta property="og:title" content="Homepage" />
		</Helmet>
	);
	render() {
		return (
			<div className="center-align">
				{this.renderHead()}
				home page
			</div>
		);
	}
}

export default { component: HomePage };
