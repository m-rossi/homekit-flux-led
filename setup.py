from setuptools import setup


with open('README.md') as f:
    long_description = f.read()

setup(
    author='Marco Rossi',
    author_email='developer@marco-rossi.com',
    classifiers=[
        'Development Status :: 3 - Alpha',
        'License :: OSI Approved :: MIT License',
        'Programming Language :: Python :: 3.6',
        'Programming Language :: Python :: 3.7',
    ],
    install_requires=[
        'flux_led',
        'HAP-python',
    ],
    license='MIT',
    long_description=long_description,
    long_description_content_type='text/markdown',
    name='homekit-flux-led',
    packages=[
        'homekit_flux_led',
    ],
    python_requires='>=3.6',
    setup_requires=[
        'setuptools>=38.6.0',
        'setuptools_scm',
    ],
    url='https://github.com/m-rossi/homekit-flux-led',
    use_scm_version=True,
)
