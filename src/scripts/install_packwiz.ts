import { consola } from "consola";
import { installPackwiz, PACKWIZ_VERSION } from "../cli/packwiz";

consola.info("Installing packwiz locally...");
installPackwiz(PACKWIZ_VERSION)
  .then(() => {
    consola.info("Done!");
  })
  .catch(consola.error);
