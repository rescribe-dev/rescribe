dataprocess: $(shell find dataprocess -type f)
	./dataprocess/language/src/main.py
	./dataprocess/library/src/main.py

train: $(shell find training -type f)
	./training/src/main.py --type=language
	./training/src/main.py --type=library

process-train:
	$(MAKE) dataprocess
	$(MAKE) train
