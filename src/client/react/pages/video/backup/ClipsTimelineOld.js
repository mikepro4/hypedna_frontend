import React, { Component } from "react";
import { connect } from "react-redux";
import { withStyles } from "material-ui/styles";
import { withRouter } from "react-router-dom";
import moment from "moment";
import keydown from "react-keydown";
import update from "immutability-helper";
import * as _ from "lodash";
import Clip from "./Clip";
import {
	updateTrackClips,
	optimisticTrackUpdate,
	selectClip
} from "../../../redux/actions/objectVideoActions";

const styles = theme => ({});

class ClipsTimeline extends Component {
	loadInitialState = () => {
		this.setState({
			movedClip: false,
			startedDragging: false,
			startedEditing: false,
			startedMoving: false,
			startPercent: 0,
			endPercent: 0,
			ghostWidth: 0,
			ghostDirection: null,
			ghostEndPosition: 0,
			updatedClips: [],
			updatedSingleClip: {},
			originalClips: []
		});
	};

	componentWillMount = () => {
		this.loadInitialState();
	};

	onMouseDown = event => {
		// make a copy of track's clips for editing
		this.setState({ originalClips: this.props.track.clips });
		console.log(event.target.className);

		if (
			event.target.className !== "clip" &&
			event.target.className !== "clip-name"
		) {
			console.log("start drawing clip");
			// enable drawing state
			this.setState({
				startedDragging: true,
				startPercent: this.calculateWidth(event)
			});
		} else if (
			event.target.className == "clip" ||
			event.target.className == "clip selected-clip" ||
			event.target.className == "clip-name" ||
			event.target.className == "resize-left" ||
			event.target.className == "resize-right"
		) {
			console.log("started moving clip");
			this.setState({
				startedMoving: true,
				startPercent: this.calculateWidth(event)
			});
		}
	};

	onMouseMove = event => {
		if (this.state.startedDragging) {
			this.handleDrawingClip(event);
		} else if (this.state.startedMoving) {
			this.handleMovingClip(event);
		} else if (this.state.startedResizing) {
		}
	};

	onMouseUp = event => {
		if (this.state.startedDragging) {
			// action after releasing mouse - new clip
			this.handleCreateNewClip();

			console.log("handl create");
		} else if (this.state.startedMoving) {
			// action after releasing mouse - moving clip
			if (this.state.movedClip) {
				console.log("handl move");

				this.handleMoveClip();
			}
		} else if (this.state.startedEditing) {
			// action after releasing mouse - resizing clip
			this.handleResizeClip();
		}
		this.loadInitialState();

		// reset all states
	};

	onMouseLeave = event => {
		if (this.state.originalClips.length > 0)
			this.props.track.clips = this.state.originalClips;
		this.loadInitialState();
	};

	handleDrawingClip = event => {
		// replace rendered clips with a filtered copy
		const updatedClips = this.getUpdatedTrackClips(
			{
				start: this.calculateStartEnd(event).newClipStart,
				end: this.calculateStartEnd(event).newClipEnd
			},
			this.state.originalClips
		);

		this.props.track.clips = updatedClips;

		this.setState({
			endPercent: this.calculateWidth(event),
			updatedClips: updatedClips
		});

		this.calculateGhostStyle(event);
	};

	handleMovingClip = event => {
		const filteredClipArray = _.filter(this.state.originalClips, clip => {
			return clip._id == this.props.selectedClip._id;
		});

		let newMovedClip = {};
		let diff =
			this.calculateStartEnd(event).newClipEnd -
			this.calculateStartEnd(event).newClipStart;

		if (diff > 0) {
			this.setState({
				movedClip: true
			});

			if (
				this.calculateStartEnd(event).endPosition >= this.state.startPercent
			) {
				newMovedClip = _.assign({}, filteredClipArray[0], {
					start: this.props.selectedClip.start + diff,
					end: this.props.selectedClip.end + diff
				});
			} else if (
				this.calculateStartEnd(event).endPosition <= this.state.startPercent
			) {
				newMovedClip = _.assign({}, filteredClipArray[0], {
					start: this.props.selectedClip.start - diff,
					end: this.props.selectedClip.end - diff
				});
			}

			let cliptoUpdateIndex = _.findIndex(this.state.originalClips, {
				_id: this.props.selectedClip._id
			});

			let newClipsArray = update(this.state.originalClips, {
				$splice: [[cliptoUpdateIndex, 1, newMovedClip]]
			});

			const updatedClips = this.getUpdatedTrackClips(
				newMovedClip,
				newClipsArray
			);
			if (updatedClips.length > 0) {
				this.props.track.clips = updatedClips;
				console.log(updatedClips);

				// this.props.optimisticTrackUpdate(
				// 	_.assign({}, this.props.track, { clips: updatedClips })
				// );

				this.setState({
					updatedSingleClip: newMovedClip,
					updatedClips: updatedClips
				});
			}
		}
	};

	handleEditingClip = () => {};

	handleCreateNewClip = () => {
		let { start, end } = 0;
		console.log(this.state.endPercent);

		if (this.state.endPercent == 0) {
			// create fixed sized clip when didn't move the mouse at all
			this.addFixSizeClip();
		} else if (this.state.endPercent > 0) {
			start =
				this.state.endPercent > this.state.startPercent
					? this.state.startPercent
					: this.state.endPercent;
			end =
				this.state.endPercent < this.state.startPercent
					? this.state.startPercent
					: this.state.endPercent;

			const newClip = {
				start: start * this.props.videoDuration / 100,
				end: end * this.props.videoDuration / 100,
				name: "Clip Name 2"
			};

			console.log(newClip);
			let newClipsArray = this.state.updatedClips;
			if (
				newClip.end - newClip.start > 0 &&
				this.checkIfCanAddClip(newClip, newClipsArray)
			) {
				newClipsArray.push(newClip);

				// Update track's clips immediately
				this.props.optimisticTrackUpdate(
					_.assign({}, this.props.track, { clips: newClipsArray })
				);

				// Send request and update in DB
				this.props.updateTrackClips(
					this.props.video.googleId,
					this.props.track._id,
					newClipsArray,
					track => {
						let filteredClip = _.filter(track.clips, clip => {
							return clip.end == newClip.end && clip.start == newClip.start;
						});
						this.props.selectClip(filteredClip[0]);
					}
				);
			} else {
				// create fixed size clip when slightly moved the mouse
				this.addFixSizeClip();
			}
		}
	};

	addFixSizeClip = () => {
		const newClip = {
			start: this.state.startPercent * this.props.videoDuration / 100,
			end: (this.state.startPercent + 1) * this.props.videoDuration / 100,
			name: "Clip Name 2"
		};
		let newClipsArray = this.state.originalClips;

		if (this.checkIfCanAddClip(newClip, newClipsArray)) {
			newClipsArray.push(newClip);

			// Update track's clips immediately
			if (this.state.originalClips.length > 0) {
				console.log(this.state.originalClips);
				this.props.optimisticTrackUpdate(
					_.assign({}, this.props.track, { clips: newClipsArray })
				);

				// Send request and update in DB
				this.props.updateTrackClips(
					this.props.video.googleId,
					this.props.track._id,
					newClipsArray,
					track => {
						let filteredClip = _.filter(track.clips, clip => {
							return clip.end == newClip.end && clip.start == newClip.start;
						});
						this.props.selectClip(filteredClip[0]);
					}
				);
			} else {
				console.log("else here");
			}
		}
	};

	checkIfCanAddClip = (newClip, clipsArray) => {
		const filteredClips = _.filter(clipsArray, clip => {
			let start = clip.start;
			let end = clip.end;
			const startInRange = newClip.start >= start && newClip.start <= end;
			const endInRange = newClip.end >= start && newClip.end <= end;
			return startInRange && endInRange ? true : false;
		});
		return filteredClips.length > 0 ? false : true;
	};

	handleMoveClip = () => {
		this.props.optimisticTrackUpdate(
			_.assign({}, this.props.track, { clips: this.state.updatedClips })
		);
		this.props.updateTrackClips(
			this.props.video.googleId,
			this.props.track._id,
			this.state.updatedClips,
			track => {}
		);
		// refresh clip that's selected to updated start / end
		this.props.selectClip(this.state.updatedSingleClip);
	};

	handleResizeClip = () => {};

	getUpdatedTrackClips = (newClip, clipsArray) => {
		// trim and filter overlapping clips
		const filteredClips = this.filterOverlappingClips(newClip, clipsArray);
		const trimmedClips = this.trimOverlappingClips(newClip, filteredClips);
		return trimmedClips;
	};

	filterOverlappingClips = (newClip, clipsArray) => {
		const newClipStart = newClip.start;
		const newClipEnd = newClip.end;

		// filter completely overlapping clips
		const filteredClips = _.filter(clipsArray, clip => {
			if (
				this.state.startedMoving &&
				this.props.selectedClip &&
				clip._id == this.props.selectedClip._id
			) {
				// don't filter the selected clip while moving
				return true;
			} else {
				let start = clip.start;
				let end = clip.end;

				const startInRange = start >= newClipStart && start <= newClipEnd;
				const endInRange = end >= newClipStart && end <= newClipEnd;

				let inRange = startInRange && endInRange ? true : false;

				return !inRange;
			}
		});
		return filteredClips;
	};

	trimOverlappingClips = (newClip, filteredClips) => {
		const newClipStart = newClip.start;
		const newClipEnd = newClip.end;

		const updatedChannelClips = _.map(filteredClips, clip => {
			let start = clip.start;
			let end = clip.end;
			if (newClipStart > start && newClipStart < end) {
				let diff = clip.end - newClipStart;
				end = clip.end - diff;
			}
			if (newClipEnd > start && newClipEnd < end) {
				if (newClipEnd > clip.start) {
					let diff = newClipEnd - clip.start;
					start = clip.start + diff;
				}
			}

			return {
				...clip,
				start: start,
				end: end
			};
		});

		return updatedChannelClips;
	};

	calculateWidth = event => {
		const percent =
			(event.pageX - this.refs.clip_timeline.getBoundingClientRect().x) *
			100 /
			this.refs.clip_timeline.getBoundingClientRect().width;
		return percent;
	};

	calculateHoverSeconds = event => {
		const seekSeconds =
			this.calculateWidth(event) * this.props.videoDuration / 100;
		return seekSeconds;
	};

	calculateStartEnd = event => {
		const endPosition = this.calculateWidth(event);
		let { newClipStart, newClipEnd } = 0;

		// select start and end based on left / right direction
		if (endPosition > this.state.startPercent) {
			newClipStart = this.state.startPercent * this.props.videoDuration / 100;
			newClipEnd = endPosition * this.props.videoDuration / 100;
		} else {
			newClipEnd = this.state.startPercent * this.props.videoDuration / 100;
			newClipStart = endPosition * this.props.videoDuration / 100;
		}
		return { newClipStart, newClipEnd, endPosition };
	};

	calculateGhostStyle = event => {
		let ghostWidth;
		let ghostDirection = "";
		let ghostEndPosition = 0;

		if (this.calculateStartEnd(event).endPosition > this.state.startPercent) {
			ghostWidth =
				this.calculateStartEnd(event).endPosition - this.state.startPercent;
			ghostDirection = "right";
		} else {
			ghostWidth =
				this.state.startPercent - this.calculateStartEnd(event).endPosition;
			ghostEndPosition = this.calculateStartEnd(event).endPosition;
			ghostDirection = "left";
		}

		this.setState({
			ghostWidth: ghostWidth,
			ghostDirection: ghostDirection,
			ghostEndPosition: ghostEndPosition
		});
	};

	getGhostStyle = () => {
		let ghostStyle = {};
		if (this.state.ghostDirection === "left") {
			ghostStyle = {
				width: this.state.ghostWidth + "%",
				left: this.state.ghostEndPosition + "%"
			};
		} else if (this.state.ghostDirection === "right") {
			ghostStyle = {
				left: this.state.startPercent + "%",
				width: this.state.ghostWidth + "%"
			};
		}
		return ghostStyle;
	};

	render() {
		return (
			<div className="video-single-track-clips">
				<div
					className="track-clips-timeline"
					ref="clip_timeline"
					onMouseDown={this.onMouseDown}
					onMouseUp={this.onMouseUp}
					onMouseLeave={this.onMouseLeave}
					onMouseMove={this.onMouseMove}
				>
					<div className="ghost-clip" style={this.getGhostStyle()} />
					{this.props.track.clips
						? this.props.track.clips.map((clip, i) => {
								return <Clip clip={clip} clipPosition={i} key={i} />;
							})
						: ""}
				</div>
			</div>
		);
	}
}

function mapStateToProps(state) {
	const videoDuration = moment
		.duration(state.pageVideo.singleVideo.contentDetails.duration)
		.asSeconds();
	return {
		currentVideo: state.currentVideo,
		video: state.pageVideo.singleVideo,
		videoDuration: videoDuration,
		selectedClip: state.pageVideo.selectedClip
	};
}

export default connect(mapStateToProps, {
	updateTrackClips,
	optimisticTrackUpdate,
	selectClip
})(withStyles(styles)(withRouter(ClipsTimeline)));
