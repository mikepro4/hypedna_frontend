import React, { Component } from "react";
import { connect } from "react-redux";
import IconButton from "material-ui/IconButton";
import { withStyles } from "material-ui/styles";
import HomeIcon from "material-ui-icons/Home";
import SearchIcon from "material-ui-icons/Search";
import LabelIcon from "material-ui-icons/Label";
import DescriptionIcon from "material-ui-icons/Description";
import PersonIcon from "material-ui-icons/Person";
import SubscriptionsIcon from "material-ui-icons/Subscriptions";
import FormatShapesIcon from "material-ui-icons/FormatShapes";
import { Link } from "react-router-dom";
import * as _ from "lodash";

let sharedLinkStyle = {
	width: 55,
	"& > span": {
		flexDirection: "column"
	}
};

const styles = theme => ({
	linkItem: _.assign({ "&:hover": { color: "#000000" } }, sharedLinkStyle),
	linkItemActive: _.assign({ color: "#4580e6" }, sharedLinkStyle),
	linkLabel: {
		fontSize: "10px",
		fontWeight: 400,
		marginTop: "5px"
	}
});

class NavigationSidebar extends Component {
	render() {
		return (
			<div className="navigation-sidebar">
				<ul className="sidebar-links">
					<li className="single-sidebar-link">
						<IconButton
							className={
								this.props.location.pathname == "/"
									? this.props.classes.linkItemActive
									: this.props.classes.linkItem
							}
							aria-label="Home"
							component={Link}
							to="/"
						>
							<HomeIcon />
							<div className={this.props.classes.linkLabel}>Home</div>
						</IconButton>
					</li>

					<li className="single-sidebar-link">
						<IconButton
							className={
								this.props.location.pathname == "/search"
									? this.props.classes.linkItemActive
									: this.props.classes.linkItem
							}
							aria-label="Search"
							component={Link}
							to="/search"
						>
							<SearchIcon />
							<div className={this.props.classes.linkLabel}>Search</div>
						</IconButton>
					</li>

					<li className="single-sidebar-link">
						<IconButton
							className={
								this.props.location.pathname == "/ontology"
									? this.props.classes.linkItemActive
									: this.props.classes.linkItem
							}
							aria-label="Tags"
							component={Link}
							to="/ontology"
						>
							<DescriptionIcon />
							<div className={this.props.classes.linkLabel}>Ontology</div>
						</IconButton>
					</li>

					<li className="single-sidebar-link">
						<IconButton
							className={
								this.props.location.pathname == "/profile"
									? this.props.classes.linkItemActive
									: this.props.classes.linkItem
							}
							aria-label="Tags"
							component={Link}
							to="/profile"
						>
							<PersonIcon />
							<div className={this.props.classes.linkLabel}>My Profile</div>
						</IconButton>
					</li>

					<li className="single-sidebar-link">
						<IconButton
							className={
								this.props.location.pathname == "/ui_kit"
									? this.props.classes.linkItemActive
									: this.props.classes.linkItem
							}
							aria-label="UI Kit"
							component={Link}
							to="/ui_kit"
						>
							<FormatShapesIcon />
							<div className={this.props.classes.linkLabel}>UI Kit</div>
						</IconButton>
					</li>
				</ul>
			</div>
		);
	}
}

const mapStateToProps = () => ({});

export default connect(mapStateToProps)(withStyles(styles)(NavigationSidebar));
