import type { ImageSourcePropType } from 'react-native';

const skillImageSources: Record<string, ImageSourcePropType> = {
  cabinet_installation: require('../../assets/skills/cabinet_installation.png'),
  carpentry: require('../../assets/skills/carpentry.png'),
  caulking_sealing: require('../../assets/skills/caulking_sealing.png'),
  deck_building_repair: require('../../assets/skills/deck_building_repair.png'),
  dishwasher_hookup: require('../../assets/skills/dishwasher_hookup.png'),
  door_installation: require('../../assets/skills/door_installation.png'),
  drain_unclogging: require('../../assets/skills/drain_unclogging.png'),
  drywall_installation: require('../../assets/skills/drywall_installation.png'),
  drywall_repair: require('../../assets/skills/drywall_repair.png'),
  ev_charger_installation: require('../../assets/skills/ev_charger_installation.png'),
  exterior_painting: require('../../assets/skills/exterior_painting.png'),
  faucet_installation_repair: require('../../assets/skills/faucet_installation_repair.png'),
  fence_installation_repair: require('../../assets/skills/fence_installation_repair.png'),
  flooring_installation: require('../../assets/skills/flooring_installation.png'),
  framing: require('../../assets/skills/framing.png'),
  furniture_assembly: require('../../assets/skills/furniture_assembly.png'),
  garbage_disposal_installation: require('../../assets/skills/garbage_disposal_installation.png'),
  grout_repair: require('../../assets/skills/grout_repair.png'),
  interior_painting: require('../../assets/skills/interior_painting.png'),
  leak_detection_repair: require('../../assets/skills/leak_detection_repair.png'),
  pipe_replacement: require('../../assets/skills/pipe_replacement.png'),
  plaster_repair: require('../../assets/skills/plaster_repair.png'),
  security_camera_installation: require('../../assets/skills/security_camera_installation.png'),
  showerhead_installation: require('../../assets/skills/showerhead_installation.png'),
  sink_installation: require('../../assets/skills/sink_installation.png'),
  smart_home_device_installation: require('../../assets/skills/smart_home_device_installation.png'),
  solar_light_installation: require('../../assets/skills/solar_light_installation.png'),
  stair_repair: require('../../assets/skills/stair_repair.png'),
  tile_installation: require('../../assets/skills/tile_installation.png'),
  tile_repair: require('../../assets/skills/tile_repair.png'),
  toilet_installation_repair: require('../../assets/skills/toilet_installation_repair.png'),
  trim_molding_installation: require('../../assets/skills/trim_molding_installation.png'),
  wallpaper_installation_removal: require('../../assets/skills/wallpaper_installation_removal.png'),
  wifi_doorbell_installation: require('../../assets/skills/wifi_doorbell_installation.png'),
  window_installation: require('../../assets/skills/window_installation.png'),
};

export function getSkillImageSource(skillKey: string) {
  return skillImageSources[skillKey];
}