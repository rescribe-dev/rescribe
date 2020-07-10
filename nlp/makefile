clean:
	rm -rf .mypy_cache dataload/.model_inputs training/.model_inputs
	rm -f model_inputs.tar.gz

# if any file is changed run this
dataload: $(shell find dataload -type f)
	python3 dataload/src/main.py

train: $(shell find training -type f)
	python3 training/src/main.py

load-train:
	$(MAKE) dataload
	$(MAKE) train
