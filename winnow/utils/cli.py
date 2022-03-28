from winnow.pipeline.pipeline_context import PipelineContext
from winnow.utils.config import resolve_config


def create_pipeline(
    config_path=None,
    frame_sampling=None,
    save_frames=None,
    override_templates=None,
    templates_dir=None,
    templates_distance=None,
    templates_distance_min=None,
    filter_dark=None,
    dark_threshold=None,
    extensions=None,
    match_distance=None,
    min_duration=None,
    hash_mode=None,
) -> PipelineContext:
    """Create pipeline from CLI arguments."""
    config = resolve_config(
        config_path=config_path,
        frame_sampling=frame_sampling,
        save_frames=save_frames,
        override_templates=override_templates,
        templates_dir=templates_dir,
        templates_distance=templates_distance,
        templates_distance_min=templates_distance_min,
        filter_dark=filter_dark,
        dark_threshold=dark_threshold,
        extensions=extensions,
        match_distance=match_distance,
        min_duration=min_duration,
        hash_mode=hash_mode,
    )
    pipeline = PipelineContext(config)
    return pipeline
