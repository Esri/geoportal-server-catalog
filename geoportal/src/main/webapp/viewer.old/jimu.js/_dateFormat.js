///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 - 2018 Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////

define([],
  function() {
    return {
      'ar': {
        'date': {
          'short': 'd/M/y',
          'medium': 'dd/MM/y',
          'long': 'd MMMM. y',
          'onlyDate': 'dd/MM',
          'mNoDay': 'MM/y',
          'sNoDay': 'M/y'
        },
        'time': {
          'short': 'h:mm a',
          'medium': 'h:mm:ss a'
        }
      },
      'bs': {
        'date': {
          'short': 'd.M.yy.',
          'medium': 'd. MMM. y.',
          'long': 'd. MMMM y.',
          'onlyDate': 'd. MMM.',
          'mNoDay': 'MMM. y.',
          'sNoDay': 'M.yy'
        }
      },
      'cs': {
        'date': {
          'short': 'dd.MM.yy',
          'medium': 'd. M. y',
          'onlyDate': 'd. M.',
          'mNoDay': 'M. y',
          'sNoDay': 'MM.yy'
        }
      },
      'da': {
        'date': {
          'short': 'dd/MM/y',
          'medium': 'd. MMM y',
          'long': 'd. MMMM y',
          'onlyDate': 'd. MMM',
          'mNoDay': 'MMM y',
          'sNoDay': 'MM/y'
        }
      },
      'de': {
        'date': {
          'short': 'dd.MM.yy',
          'medium': 'dd.MM.y',
          'onlyDate': 'dd.MM.'
        },
        'connector': ' , ',
        'mNoDay': 'MM.y',
        'sNoDay': 'MM.yy'
      },
      'el': {
        'date': {
          'short': 'd/M/yy',
          'medium': 'd MMM y',
          'onlyDate': 'd MMM'
        },
        'connector': ' , ',
        'mNoDay': 'MMM y',
        'sNoDay': 'M/yy'
      },
      'en': {
        'date': {
          'short': 'M/d/yy',
          'medium': 'MMM d, y',
          'onlyDate': 'MMM d',
          'mNoDay': 'MMM, y',
          'sNoDay': 'M/yy'
        }
      },
      'es': {
        'date': {
          'short': 'd/M/yy',
          'medium': 'd MMM y',
          'onlyDate': 'd MMM',
          'mNoDay': 'MMM y',
          'sNoDay': 'M/yy'
        }
      },
      'et': {
        'date': {
          'short': 'd.MM.y',
          'medium': 'd. MMM y',
          'onlyDate': 'd. MMM',
          'mNoDay': 'MMM y',
          'sNoDay': 'MM.y'
        },
        'time': {
          'short': 'H:mm',
          'medium': 'H:mm:ss'
        }
      },
      'fi': {
        'date': {
          'short': 'd.M.y',
          'medium': 'd.M.y',
          'onlyDate': 'd.M.',
          'mNoDay': 'M.y',
          'sNoDay': 'M.y'
        },
        'connector': " 'klo' "
      },
      'fr': {
        'date': {
          'short': 'dd/MM/y',
          'medium': 'd MMM y',
          'onlyDate': 'd MMM',
          'mNoDay': 'MMM y',
          'sNoDay': 'MM/y'
        },
        'connector': " 'à' "
      },
      'he': {
        'date': {
          'short': 'dd/MM/yy',
          'medium': "d 'ב'MMM y",
          'onlyDate': "d 'ב'MMM",
          'mNoDay': "'ב'MMM y",
          'sNoDay': 'MM/yy'
        },
        'connector': ' , '
      },
      'hi': {
        'date': {
          'short': 'd/M/yy',
          'medium': 'dd/MM/y',
          'long': 'd MMMM y',
          'onlyDate': 'dd/MM',
          'mNoDay': 'MM/y',
          'sNoDay': 'M/yy'
        },
        'time': {
          'short': 'h:mm a',
          'medium': 'h:mm:ss a',
          'sNoDay': ''
        },
        'connector': ' , '
      },
      'hr': {
        'date': {
          'short': 'd.M.y',
          'medium': 'd. MMM y.',
          'onlyDate': 'd. MMM',
          'mNoDay': 'MMM y.',
          'sNoDay': 'M.y'
        }
      },
      'id': {
        'short': 'dd/MM/yy',
        'date': {
          'medium': 'd MMM y',
          'onlyDate': 'd MMM',
          'mNoDay': 'MMM y',
          'sNoDay': 'MM/yy'
        }
      },
      'it': {
        'date': {
          'medium': 'dd MMM y',
          'long': 'd MMMM y',
          'onlyDate': 'dd MMM',
          'mNoDay': 'MMM y',
          'sNoDay': 'MM/yy'
        },
        'connector': ' , '
      },
      'ja': {
        'date': {
          'medium': 'y/MM/dd',
          'onlyDate': 'MM/dd',
          'mNoDay': 'y/MM',
          'sNoDay': 'y/MM'
        },
        'time': {
          'short': 'a h:mm',
          'medium': 'a h:mm:ss'
        }
      },
      'ko': {
        'date': {
          'medium': 'y. M. d.',
          'onlyDate': 'M. d.',
          'mNoDay': 'y. M.',
          'sNoDay': 'yy. M.'
        }
      },
      'lt': {
        'date': {
          'medium': 'y-MM-dd',
          'long': "y 'm'. MMMM d 'd'.",
          'onlyDate': 'MM-dd',
          'mNoDay': 'y-MM',
          'sNoDay': 'y-MM'
        },
        'time': {
          'medium': 'HH:mm:ss'
        }
      },
      'lv': {
        'date': {
          'short': 'dd.MM.y',
          'medium': "y. 'gada' d. MMM.",
          'long': "y. 'gada' d. MMMM",
          'onlyDate': 'd. MMM.',
          'mNoDay': "y. 'gada' MMM.",
          'sNoDay': 'MM.y'
        }
      },
      'nb': {
        'date': {
          'short': 'dd.MM.y',
          'medium': 'd. MMM y',
          'long': 'd. MMMM y',
          'onlyDate': 'd. MMM',
          'mNoDay': 'MMM y',
          'sNoDay': 'MM.y'
        },
        'time': {
          'short': 'HH:mm',
          'medium': 'HH:mm:ss'
        },
        'connector': ' , '
      },
      'nl': {
        'date': {
          'medium': 'd MMM y',
          'onlyDate': 'd MMM',
          'mNoDay': 'MMM y',
          'sNoDay': 'MM-yy'
        }
      },
      'pl': {
        'date': {
          'medium': 'd MMM y',
          'onlyDate': 'd MMM',
          'mNoDay': 'MMM y',
          'sNoDay': 'MM.y'
        },
        'connector': ' , '
      },
      'pt-br': {
        'date': {
          'short': 'dd/MM/y',
          'medium': "d 'de' MMM 'de' y",
          'onlyDate': "d 'de' MMM",
          'mNoDay': "MMM 'de' y",
          'sNoDay': 'MM/y'
        }
      },
      'pt-pt': {
        'date': {
          'medium': 'dd/MM/y',
          'onlyDate': 'dd/MM',
          'mNoDay': 'MM/y',
          'sNoDay': 'MM/yy'
        }
      },
      'ro': {
        'date': {
          'medium': 'd MMM y',
          'onlyDate': 'd MMM',
          'mNoDay': 'MMM y',
          'sNoDay': 'MM.y'
        },
        'connector': ' , '
      },
      'ru': {
        'date': {
          'short': 'dd.MM.y',
          'medium': "d MMM y 'г.'",
          'onlyDate': 'd MMM',
          'mNoDay': "MMM y 'г.'",
          'sNoDay': 'MM.y'
        },
        'connector': ' , '
      },
      'sr': {
        'date': {
          'medium': 'dd.MM.y.',
          'onlyDate': 'dd.MM.',
          'mNoDay': 'MM.y.',
          'sNoDay': 'M.yy.'
        },
        'time': {
          'short': 'HH:mm',
          'medium': 'HH:mm:ss'
        }
      },
      'sv': {
        'date': {
          'medium': 'd MMM. y',
          'onlyDate': 'd MMM.',
          'mNoDay': 'MMM. y',
          'sNoDay': 'y-MM'
        }
      },
      'th': {
        'date': {
          'medium': 'd MMM y',
          'onlyDate': 'd MMM',
          'mNoDay': 'MMM y',
          'sNoDay': 'M/yy'
        }
      },
      'tr': {
        'date': {
          'medium': 'd MMM y',
          'onlyDate': 'd MMM',
          'mNoDay': 'MMM y',
          'sNoDay': 'MM.y'
        }
      },
      'vi': {
        'date': {
          'short': 'dd/MM/y',
          'medium': 'd MMM, y',
          'long': "'Ngày' dd 'tháng' MM 'năm' y",
          'onlyDate': 'd MMM',
          'mNoDay': 'MMM, y',
          'sNoDay': 'MM/y'
        },
        'time': {
          'short': 'hh:mm a',
          'medium': 'hh:mm:ss a'
        },
        'connector': ' , '
      },
      'zh-cn': {
        'date': {
          'short': 'y/M/d',
          'medium': "y'年'M'月'd'日'",
          'onlyDate': "M'月'd'日'",
          'mNoDay': "y'年'M'月'",
          'sNoDay': 'y/M'
        }
      },
      'zh-hk': {
        'date': {
          'medium': "y'年'M'月'd'日'",
          'onlyDate': "M'月'd'日'",
          'mNoDay': "y'年'M'月'",
          'sNoDay': 'M/y'
        }
      },
      'zh-tw': {
        'date': {
          'medium': "y'年'M'月'd'日'",
          'onlyDate': "M'月'd'日'",
          'mNoDay': "y'年'M'月'",
          'sNoDay': 'y/M'
        }
      }
    };
  });