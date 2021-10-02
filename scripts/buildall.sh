mkdir -p public/images/icons
python3 scripts/build-static.py
python3 scripts/make-icons.py
python3 scripts/make-note-icons.py
python3 scripts/make-gracenote-icons.py
