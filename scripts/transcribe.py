"""Audio + prompt -> storyboard.json (scenes synced to the speech)."""
import json, os, re, shutil, subprocess, sys

EXT = (".mp3", ".wav", ".m4a", ".ogg", ".aac", ".flac")
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def log_error(msg):
    with open("errors.md", "a", encoding="utf-8") as f:
        f.write(msg + "\n")


def find_audio():
    for folder in ("audio", "."):
        if os.path.isdir(folder):
            for name in sorted(os.listdir(folder)):
                if name.lower().endswith(EXT):
                    return os.path.join(folder, name)
    return None


def read_prompt():
    try:
        with open("ideas/queue.md", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("- "):
                    return line[2:].strip()
    except FileNotFoundError:
        pass
    return ""


def pick_colors(prompt):
    p = prompt.lower()
    light = "light" in p or "white" in p
    bg, bg2, text = ("#f5f7fb", "#dfe7f5", "#111827") if light else ("#0b0f1a", "#1b2a4a", "#ffffff")
    accents = {"red": "#ef4444", "green": "#22c55e", "purple": "#a855f7",
               "orange": "#f97316", "pink": "#ec4899", "yellow": "#facc15"}
    accent = "#2563eb" if light else "#4cc9f0"
    for word, hexcode in accents.items():
        if word in p:
            accent = hexcode
    return {"bg": bg, "bg2": bg2, "text": text, "accent": accent}


def get_duration(path):
    out = subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=nw=1:nk=1", path])
    return float(out.decode().strip())


def main():
    audio = find_audio()
    if not audio:
        print("no audio file found, skipping")
        return
    prompt = read_prompt()
    cfg = json.load(open("config.json", encoding="utf-8"))
    ext = os.path.splitext(audio)[1].lower()
    os.makedirs("public", exist_ok=True)
    shutil.copy(audio, "public/audio" + ext)
    duration = get_duration(audio)

    segs = []
    try:
        from faster_whisper import WhisperModel
        model = WhisperModel("base", device="cpu", compute_type="int8")
        raw, _info = model.transcribe(audio)
        for s in raw:
            text = s.text.strip()
            if text:
                segs.append([s.start, s.end, text])
    except Exception as e:  # keep going with a plain video
        log_error("transcribe failed: %s" % e)

    # merge very short segments into the next one
    merged = []
    for seg in segs:
        if merged and (merged[-1][1] - merged[-1][0]) < 1.2:
            merged[-1][1] = seg[1]
            merged[-1][2] += " " + seg[2]
        else:
            merged.append(seg)

    scenes = []
    if merged:
        starts = [0.0] + [m[0] for m in merged[1:]]
        ends = starts[1:] + [duration]
        for st, en, m in zip(starts, ends, merged):
            scenes.append({"title": m[2], "subtitle": "",
                           "seconds": round(max(0.5, en - st), 2)})
    else:
        scenes.append({"title": prompt or cfg.get("brand", ""),
                       "subtitle": "", "seconds": round(duration, 2)})

    stem = re.sub(r"[^a-z0-9]+", "_", os.path.splitext(os.path.basename(audio))[0].lower()).strip("_")
    sb = {
        "name": stem or "audio_video",
        "fps": cfg.get("fps", 30),
        "audio": "audio" + ext,
        "label": cfg.get("brand", ""),
        "colors": pick_colors(prompt),
        "scenes": scenes,
    }
    with open("storyboard.json", "w", encoding="utf-8") as f:
        json.dump(sb, f, indent=2, ensure_ascii=False)
    print("storyboard.json written: %d scenes, %.1fs" % (len(scenes), duration))


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        log_error("transcribe.py crashed: %s" % e)
        print("transcribe error (logged), continuing:", e)
        sys.exit(0)
