from pathlib import Path
import re

MODULE_TAGS = """<script src=\"./js/app/bootstrap.js\" defer></script>
<script src=\"./js/app/lifecycle.js\" defer></script>
<script src=\"./js/battle/gameController.js\" defer></script>
<script src=\"./js/sandbox/controller.js\" defer></script>
<script src=\"./js/sandbox/scenarios.js\" defer></script>
<script src=\"./js/ui/cardViewModel.js\" defer></script>
<script src=\"./js/ui/renderVals.js\" defer></script>
"""

COMPONENT = """class Component extends DCLogic {
  state = createMfcInitialState();
}
installMfcMixin(Component, MFCLifecycleController);
installMfcMixin(Component, MFCGameController);
installMfcMixin(Component, MFCSandboxController);
installMfcMixin(Component, MFCSandboxScenarioController);
installMfcMixin(Component, MFCCardViewModelController);
Component.prototype.renderVals = mfcRenderVals;
"""

SCRIPT_RE = re.compile(
    r'(<script type="text/x-dc" data-dc-script data-props="[^"]*">).*?(</script>\s*</body>)',
    re.S,
)
PRELOADER = '<script src="./js/core/preloader.js" defer></script>'


def migrate(path: Path) -> None:
    src = path.read_text(encoding="utf-8")
    if './js/app/bootstrap.js' not in src:
        if PRELOADER not in src:
            raise RuntimeError(f"preloader marker not found in {path}")
        src = src.replace(PRELOADER, MODULE_TAGS + PRELOADER, 1)

    match = SCRIPT_RE.search(src)
    if not match:
        raise RuntimeError(f"DC component block not found in {path}")
    src = src[:match.start()] + match.group(1) + "\n" + COMPONENT + match.group(2) + src[match.end():]
    path.write_text(src, encoding="utf-8")


for file_name in ("index.html", "Marvel Fan Cards.dc.html"):
    path = Path(file_name)
    if path.exists():
        migrate(path)
