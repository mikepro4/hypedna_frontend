import React, { Component } from "react";
import { connect } from "react-redux";
import { renderRoutes } from "react-router-config";
import { Helmet } from "react-helmet";
import { withStyles } from "material-ui/styles";
import { withRouter } from "react-router-dom";
import VideoAddForm from "./Video_add_form";
import { youtubeUrlParser } from "../../../../utils/youtube";
import {
	loadYoutubeVideoDetails,
	addYoutubeVideo,
	clearLoadedYoutubeVideo
} from "../../../../redux/actions/youtubeVideoSearch";
import { updatePlayerVideo } from "../../../../redux/actions/player";
import YoutubePlayer from "../../../components/common/player/Player";
import moment from "moment";

const styles = theme => ({});

class CreateVideoPage extends Component {
	handleFormSubmit = ({ url }) => {
		if (youtubeUrlParser(url)) {
			this.props.loadYoutubeVideoDetails(youtubeUrlParser(url), history);
		}
	};

	handleAddVideo = () => {
		this.props.addYoutubeVideo(this.props.video, this.props.history, () => {
			console.log("callback");
		});
	};

	render() {
		if (!this.props.form.addvideo && this.props.video) {
			this.props.clearLoadedYoutubeVideo();
		}

		return (
			<div className="route-content-container">
				<h3
					style={{
						margin: "0 0 5px 0",
						fontSize: "20px"
					}}
				>
					Add Video
				</h3>
				<div className="video-add-form">
					<VideoAddForm
						onSubmit={this.handleFormSubmit.bind(this)}
						onChange={values => {
							if (youtubeUrlParser(values.url)) {
								this.props.clearLoadedYoutubeVideo();
								this.handleFormSubmit({ url: values.url });
							} else {
								this.props.clearLoadedYoutubeVideo();
							}
						}}
					/>
				</div>

				{this.props.isFetching ? (
					<div>Loading...</div>
				) : (
					<div className="loaded-video-container">
						{this.props.player.playingVideoId && this.props.video.snippet ? (
							<div className="loaded-video-container">
								<div className="loaded-video-player-area">
									<YoutubePlayer
										width="680"
										height="380"
										videoId={this.props.player.playingVideoId}
									/>
									<div className="video-description">
										<h2 className="video-title">
											{this.props.video.snippet.title}
										</h2>
									</div>
								</div>
								<button onClick={this.handleAddVideo}>add video</button>
							</div>
						) : (
							""
						)}
					</div>
				)}
			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		form: state.form,
		video: state.youtubeVideoSearch.singleVideo,
		isFetching: state.youtubeVideoSearch.isFetching,
		player: state.player
	};
}

export default {
	component: connect(mapStateToProps, {
		loadYoutubeVideoDetails,
		addYoutubeVideo,
		clearLoadedYoutubeVideo
	})(withStyles(styles)(withRouter(CreateVideoPage)))
};
