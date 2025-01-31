#!/usr/bin/python
# go through list of file geodatabases, generate metadata for each feature class and publishes those to Geoportal Sever 2.x
import codecs
import os
import sys

os.environ["ARCPY_NO_IMPORTS"] = "1"

import requests
from requests.auth import HTTPBasicAuth
import arcpy
from arcpy import metadata as md

start_dir = r"C:\data\arcgis"  # the physical folder where metadata xml files will be exported
dataset_list = ["DBO.SDIMetadata"] #add comma separated list of feature dataset to be processed, remaining will be skipped
#if empty, all feature classes will be processed in datasets mentioned above. To process only selected files, add comma separated list of feature class name
featureclass_list = []

# SDE connection string
sdeconnection = r"D:\Geoportal\Geoportal(sa).sde"

# The URL for the geoportal 2.x's document management API.
# server = 'http://<server>:<port>/geoportal/rest/metadata/item'
server = 'http://localhost:8080/geoportal/rest/metadata/item'

token = arcpy.GetSigninToken()
if token is None:
    sys.exit("Please sign in to Portal to execute this script.")
portal_desc = arcpy.GetPortalDescription()
poartusername = portal_desc['user']['username']
auth = HTTPBasicAuth(poartusername, '__rtkn__:' + token['token'])
headers = {"Content-Type": "application/json; charset=utf-8"}

def read_metadata(folder, dataset):
    f = os.path.join(folder, dataset)
    print("reading from "+ f)
    # Get the source item's Metadata object
    src_item_md = md.Metadata(f)

    # Synchronize the item's metadata now
    src_item_md.synchronize('ALWAYS')

    # Export the item's metadata using the export format (ISO 19115-3)
    # after removing sensitive information from the metadata, if it exists.
    export_file_path = os.path.join(start_dir, dataset) + '.xml'
    export_file_mod_path = os.path.join(start_dir, dataset) + '_mod.xml'

    src_item_md.exportMetadata(export_file_path, 4,
                               metadata_removal_option='REMOVE_ALL_SENSITIVE_INFO')

    searchtxt = '<mdb:MD_Metadata'
    header_template = """<mdb:MD_Metadata xmlns:cat="http://standards.iso.org/iso/19115/-3/cat/1.0" xmlns:cit="http://standards.iso.org/iso/19115/-3/cit/2.0" xmlns:gcx="http://standards.iso.org/iso/19115/-3/gcx/1.0" xmlns:gex="http://standards.iso.org/iso/19115/-3/gex/1.0" xmlns:lan="http://standards.iso.org/iso/19115/-3/lan/1.0" xmlns:srv="http://standards.iso.org/iso/19115/-3/srv/2.0" xmlns:mac="http://standards.iso.org/iso/19115/-3/mac/2.0" xmlns:mas="http://standards.iso.org/iso/19115/-3/mas/1.0" xmlns:mcc="http://standards.iso.org/iso/19115/-3/mcc/1.0" xmlns:mco="http://standards.iso.org/iso/19115/-3/mco/1.0" xmlns:mda="http://standards.iso.org/iso/19115/-3/mda/1.0" xmlns:mdb="http://standards.iso.org/iso/19115/-3/mdb/2.0" xmlns:mdt="http://standards.iso.org/iso/19115/-3/mdt/1.0" xmlns:mex="http://standards.iso.org/iso/19115/-3/mex/1.0" xmlns:mrl="http://standards.iso.org/iso/19115/-3/mrl/1.0" xmlns:mds="http://standards.iso.org/iso/19115/-3/mds/1.0" xmlns:mmi="http://standards.iso.org/iso/19115/-3/mmi/1.0" xmlns:mpc="http://standards.iso.org/iso/19115/-3/mpc/1.0" xmlns:mrc="http://standards.iso.org/iso/19115/-3/mrc/2.0" xmlns:mrd="http://standards.iso.org/iso/19115/-3/mrd/1.0" xmlns:mri="http://standards.iso.org/iso/19115/-3/mri/1.0" xmlns:mrs="http://standards.iso.org/iso/19115/-3/mrs/1.0" xmlns:msr="http://standards.iso.org/iso/19115/-3/msr/2.0" xmlns:mdq="http://standards.iso.org/iso/19157/-2/mdq/1.0" xmlns:dqc="http://standards.iso.org/iso/19157/-2/dqc/1.0" xmlns:gco="http://standards.iso.org/iso/19115/-3/gco/1.0" xmlns:gfc="http://standards.iso.org/iso/19110/gfc/1.1" xmlns:gml="http://www.opengis.net/gml/3.2" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">"""
    with open(export_file_path, 'r', encoding='utf-8') as file:
        filecontent = file.readlines()

    # Find line, where modification should be done
    for lineIndex in range(len(filecontent)):

        if (searchtxt in filecontent[lineIndex]):
            filecontent[lineIndex] = header_template

            modifiedfile = codecs.open(export_file_mod_path, 'w', encoding='utf-8')
            modifiedfile.writelines(filecontent)
            break

    modcontent = open(export_file_mod_path, 'r', encoding='utf-8')

    metadata = modcontent.read().encode('utf-8')
    #print('metadata with modified header '+metadata)
    return metadata

def publish_metadata(metadata):
    #print(metadata)
    r = requests.put(url=server, data=metadata, auth=auth, headers=headers)
    try:
        result = r.json()
        print(f"{r.status_code} content['resTitle'] - {result}\n'")
    except ValueError:
        print(r)

def process_feature_class(workspace,fc):
    print("reading metadata for " + fc)
    metadata = read_metadata(workspace, fc)
    print("metadata retrieved for " + fc)
    if len(metadata) > 0:
        print("publishing metadata for " + fc)
        publish_metadata(metadata)

def parse_workspace(workspace):
    arcpy.env.workspace = workspace;

    feature_classes = arcpy.ListFeatureClasses()

    # List all feature classes within feature datasets in the geodatabase
    for dataset in arcpy.ListDatasets("", "Feature"):
        print(dataset)
        if dataset in dataset_list:
            print("process dataset "+dataset)
            for featureclass in arcpy.ListFeatureClasses("", "All", dataset):
                feature_classes.append(featureclass)

            # Go through list of feature classes
            if len(featureclass_list) == 0:
                print("processing all feature classes for dataset " + dataset)
                for fc in feature_classes:
                    process_feature_class(workspace, fc)
            else:
                for fc in feature_classes:
                    if fc in featureclass_list:
                        process_feature_class(workspace, fc)
                    else:
                        print("skipping feature class " + fc)
        else:
            print("skipping dataset "+dataset)

def main():
    parse_workspace(sdeconnection)

if __name__ == '__main__':
    main()
