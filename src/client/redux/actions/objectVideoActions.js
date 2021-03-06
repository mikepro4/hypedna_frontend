import moment from "moment";
import {
	DELETE_VIDEO,
	DELETE_VIDEO_SUCCESS,
	UPDATE_VIDEO_TRACK,
	SELECT_CLIP
} from "./types";
import { loadHypednaVideoDetails } from "./pageVideoActions";
import update from "immutability-helper";
import * as _ from "lodash";

export const deleteVideo = (googleId, success) => async (
	dispatch,
	getState,
	api
) => {
	dispatch({
		type: DELETE_VIDEO,
		payload: googleId
	});
	const response = await api.post("/video_delete", {
		googleId
	});
	dispatch({
		type: DELETE_VIDEO_SUCCESS,
		payload: response.data
	});

	success(response.data);
};

export const clearLoadedHypednaVideo = () => dispatch => {
	dispatch({
		type: CLEAR_LOADED_HYPEDNA_VIDEO
	});
};
