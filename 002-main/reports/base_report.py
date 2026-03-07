from abc import ABC, abstractmethod
import pandas as pd

class BaseReport(ABC):
	def __init__(self, filepath: str):
		self.filepath = filepath
		self.df = None

	@abstractmethod
	def load(self):
		pass

	@abstractmethod
	def generate(self, output_path: str):
		pass


